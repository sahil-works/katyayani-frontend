#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly APP_NAME="katyayani-storefront"
readonly IMAGE_TAG="${APP_NAME}:staging"
readonly PORT=3200
readonly PARAM_PATH="/katyayani/staging/frontend"
readonly HEALTH_URL="http://127.0.0.1:${PORT}/api/health"
readonly HEALTH_RETRIES=12
readonly HEALTH_INTERVAL=5

log() {
  printf '[deploy-staging] %s\n' "$*"
}

fail() {
  printf '[deploy-staging] ERROR: %s\n' "$*" >&2
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

recover_docker_storage() {
  local restart_docker="${1:-false}"

  log "Pruning stale Docker cache"
  docker builder prune -af >/dev/null 2>&1 || true
  docker system prune -af >/dev/null 2>&1 || true

  if [[ "${restart_docker}" == "true" ]]; then
    log "Restarting Docker daemon"
    if command -v systemctl >/dev/null 2>&1; then
      sudo systemctl restart docker >/dev/null 2>&1 || true
    elif command -v service >/dev/null 2>&1; then
      sudo service docker restart >/dev/null 2>&1 || true
    fi
    sleep 5
  fi
}

login_registry() {
  local token="${GHCR_PULL_TOKEN:-${DOCKER_REGISTRY_TOKEN:-}}"
  if [[ -n "${token}" ]]; then
    log "Logging in to ghcr.io"
    echo "${token}" | docker login ghcr.io -u "${GHCR_USERNAME:-github}" --password-stdin >/dev/null
  fi
}

pull_image_with_retry() {
  local image="$1"
  local attempt=1
  local max_attempts=3

  while (( attempt <= max_attempts )); do
    if docker pull "${image}"; then
      log "Pulled image ${image}"
      return 0
    fi

    log "Image pull failed (attempt ${attempt}/${max_attempts})"
    recover_docker_storage "$([[ "${attempt}" -ge 2 ]] && echo true || echo false)"
    sleep $((attempt * 5))
    attempt=$((attempt + 1))
  done

  return 1
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

deploy_pulled_image() {
  local image="$1"

  login_registry
  recover_docker_storage false
  pull_image_with_retry "${image}" || fail "Failed to pull image ${image}"

  log "Stopping existing container ${APP_NAME}"
  docker stop "${APP_NAME}" >/dev/null 2>&1 || true
  docker rm "${APP_NAME}" >/dev/null 2>&1 || true

  log "Starting container ${APP_NAME} on port ${PORT} from ${image}"
  docker run -d \
    --name "${APP_NAME}" \
    --restart unless-stopped \
    -p "${PORT}:3000" \
    "${image}" >/dev/null

  wait_for_health
  docker image prune -f >/dev/null 2>&1 || true
  log "Staging deployment completed successfully"
}

deploy_local_build() {
  log "No prebuilt IMAGE provided; building locally (legacy mode)"
  rm -rf node_modules .next .npm

  log "Loading SSM parameters from ${PARAM_PATH}"
  local app_url api_url razorpay_key
  app_url="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_APP_URL")"
  api_url="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_API_BASE_URL")"
  razorpay_key="$(ssm_get "${PARAM_PATH}/NEXT_PUBLIC_RAZORPAY_KEY_ID")"

  [[ -n "${app_url}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_APP_URL is empty"
  [[ -n "${api_url}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_API_BASE_URL is empty"
  [[ -n "${razorpay_key}" ]] || fail "SSM parameter ${PARAM_PATH}/NEXT_PUBLIC_RAZORPAY_KEY_ID is empty"

  recover_docker_storage false
  log "Building image ${IMAGE_TAG}"
  docker build \
    --build-arg NEXT_PUBLIC_APP_URL="${app_url}" \
    --build-arg NEXT_PUBLIC_API_BASE_URL="${api_url}" \
    --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="${razorpay_key}" \
    -t "${IMAGE_TAG}" \
    . || fail "Local Docker build failed"

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
  docker image prune -f >/dev/null 2>&1 || true
  log "Staging deployment completed successfully"
}

require_command aws
require_command docker
require_command curl

log "Checking disk space"
df -h / /var/lib/docker 2>/dev/null || df -h /

if [[ -n "${IMAGE:-}" ]]; then
  deploy_pulled_image "${IMAGE}"
else
  deploy_local_build
fi
