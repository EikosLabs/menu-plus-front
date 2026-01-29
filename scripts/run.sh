#!/bin/bash
DOCKER_NETWORK="glyphium-test-network"
IMAGE_NAME="glyphium-test-menuplus-front"
CONTAINER_NAME=$IMAGE_NAME

docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 || docker network create "$DOCKER_NETWORK"

docker stop "$CONTAINER_NAME" 2>/dev/null
docker rm "$CONTAINER_NAME" 2>/dev/null

docker build -t "$IMAGE_NAME" .

docker run -d \
  --name "$CONTAINER_NAME" \
  --network "$DOCKER_NETWORK" \
  -e API_BACKEND_URL=http://glyphium-test-menuplus-back:5000 \
  -e HOST=0.0.0.0 \
  -e PORT=4321 \
  -p 4321:4321 \
  "$IMAGE_NAME":latest
