#!/bin/bash
set -e

APP_NAME=katyayani-storefront
PORT=3200
PARAM_PATH=/katyayani/staging/frontend

APP_URL=$(aws ssm get-parameter \
  --name "$PARAM_PATH/NEXT_PUBLIC_APP_URL" \
  --query Parameter.Value \
  --output text)

API_URL=$(aws ssm get-parameter \
  --name "$PARAM_PATH/NEXT_PUBLIC_API_BASE_URL" \
  --query Parameter.Value \
  --output text)

RAZORPAY_KEY=$(aws ssm get-parameter \
  --name "$PARAM_PATH/NEXT_PUBLIC_RAZORPAY_KEY_ID" \
  --query Parameter.Value \
  --output text)

docker build \
  --build-arg NEXT_PUBLIC_APP_URL="$APP_URL" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$API_URL" \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="$RAZORPAY_KEY" \
  -t ${APP_NAME}:staging .

docker stop $APP_NAME || true
docker rm $APP_NAME || true

docker run -d \
  --name $APP_NAME \
  --restart unless-stopped \
  -p ${PORT}:3000 \
  ${APP_NAME}:staging