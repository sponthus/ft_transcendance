FROM node:20-alpine AS build

RUN mkdir app

# TODO Multistep docker
COPY ./frontend /app
COPY ./config/env.js /app/config/env.js
COPY ./config/logger.js /app/config/logger.js

COPY    ./frontend/config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

ENTRYPOINT ["entrypoint.sh"]
