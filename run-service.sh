# !/bin/bash

echo 'Running task service'

npm install && npm run build:dev && npm run start:dev
