#!/bin/bash

docker run \
  --name elastic \
  --rm \
  -d \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:6.3.2

