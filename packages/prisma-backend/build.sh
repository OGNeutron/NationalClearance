#!/usr/bin/env sh

npm run build

docker build -t national_clearance_backend

heroku container:pull web
heroku container:push web
heroku container:release web
