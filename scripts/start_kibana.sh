#!/bin/bash

docker run \
  --name kibana \
  --link elastic:elastic \
  -e ELASTICSEARCH_URL=http://elastic:9200 \
  -p 5601:5601 \
  --rm -d \
  docker.elastic.co/kibana/kibana:6.3.2
