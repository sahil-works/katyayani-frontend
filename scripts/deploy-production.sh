#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly APP_NAME="katyayani-storefront-production"
readonly IMAGE_TAG="katyayani-storefront:production"
readonly PORT=3201
readonly PARAM_PATH="/katyayani/production/frontend"
readonly HEALTH_URL="http://127.0.0.1:${PORT}/api/health"
readonly HEALTH_RETRIES=12
readonly HEALTH_INTERVAL=5

export BUILDKIT_PROGRESS=plain

log() {
  printf '[deploy-production] %s\n' "$*"
}

fail() {
  printf '[deploy-production] ERROR: %s\n' "$*" >&2
  exit 1
}

ssm_get() {
  local parameter_name="$1"
  aws ssm get-parameter \
    --name "${parameter_name}" \
    --query 'Parameter.Value' \
    --output text
}

require_command() {
  local command_name="$1"
  command -v "${command_name}" >/dev/null 2>&1 || fail "${command_name} is required but not installed"
}

has_buildkit() {
  docker buildx version >/dev/null 2>&1
}

prepare_docker() {
  log "Checking disk space"
  df -h / /var/lib/docker 2>/dev/null || df -h /

  log "Removing local build artifacts from deploy context"
  rm -rf node_modules .next .npm

  log "Pruning stale Docker cache"
  docker builder prune -af >/dev/null 2>&1 || true
  docker system prune -af >/dev/null 2>&1 || true
}

build_image() {
  local attempt=1
  local max_attempts=2

  while (( attempt <= max_attempts )); do
    if has_buildkit; then
      export DOCKER_BUILDKIT=1
      log "Using Docker BuildKit (attempt ${attempt}/${max_attempts})"
    else
      unset DOCKER_BUILDKIT
      log "BuildKit unavailable; using legacy Docker builder (attempt ${attempt}/${max_attempts})"
    fi

    if docker build \
      --build-arg NEXT_PUBLIC_APP_URL="${APP_URL}" \
      --build-arg NEXT_PUBLIC_API_BASE_URL="${API_URL}" \
      --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="${RAZORPAY_KEY}" \
      -t "${IMAGE_TAG}" \
      .; then
      return 0
    fi

    if (( attempt == max_attempts )); then
      return 1
    fi

    log "Docker build failed; pruning cache and retrying"
    docker builder prune -af >/dev/null 2>&1 || true
    docker system prune -af >/dev/null 2>&1 || true
    attempt=$((attempt + 1))
  done
}

wait_for_health() {
  local attempt=1
  while (( attempt <= HEALTH_RETRIES )); do
    if curl -sf "${HEALTH_URL}" >/dev/null 2>&1; then
      log "Health check passed (${HEALTH_URL})"
      return 0
    fi

    log "Health check attempt ${attempt}/${HEALTH_RETRIES} failed; retrying in ${HEALTH_INTERVAL}s..."
    sleep "${HEALTH_INTERVAL}"
    attempt=$((attempt + 1))
  done

  log "Container logs (last 50 lines):"
  docker logs "${APP_NAME}" --tail 50 2>&1 || true
  fail "Health check failed after ${HEALTH_RETRIES} attempts (${HEALTH_URL})"
}

cleanup_images() {
  log "Pruning dangling Docker images"
  docker image prune -f >/dev/null
}

require_command aws
require_command docker
require_command curl

prepare_docker

log "Loading SSM parameters from ${PARAM_PATH}"
APP_URL="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_APP_URL")"
API_URL="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_API_BASE_URL")"
RAZORPAY_KEY="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_RAZORPAY_KEY_ID")"

[[ -n "${APP_URL}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_APP_URL is empty"
[[ -n "${API_URL}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_API_BASE_URL is empty"
[[ -n "${RAZORPAY_KEY}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_RAZORPAY_KEY_ID is empty"

log "Building image ${IMAGE_TAG}"
build_image || fail "Docker build failed after retrying"

log "Stopping existing container ${APP_NAME}"
docker stop "${APP_NAME}" >/dev/null 2>&1 || true
docker rm "${APP_NAME}" >/dev/null 2>&1 || true

log "Starting container ${APP_NAME} on port ${PORT}"
docker run -d \
  --name "${APP_NAME}" \
  --restart unless-stopped \
  -p "${PORT}:3000" \
  "${IMAGE_TAG}" >/dev/null

wait_for_health
cleanup_images

log "Production deployment completed successfully"
