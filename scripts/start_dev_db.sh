#!/bin/bash

docker run -it --name mysql-db \
    -e MYSQL_ROOT_PASSWORD=dev \
    -e MYSQL_USER=dev \
    -e MYSQL_PASSWORD=dev \
    -e MYSQL_DATABASE=cars_db \
    -p 3306:3306 \
    --rm -d \
    mysql:5.7.22
