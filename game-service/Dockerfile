FROM node:20-alpine

RUN mkdir app

# Un-comment me for prod, in dev = volumes
# COPY ./game-service /app
COPY ./config/env.js /app/config/env.js
COPY ./config/logger.js /app/config/logger.js

COPY    ./game-service/config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

ARG WS_PORT
ENV WS_PORT=${WS_PORT}

EXPOSE $WS_PORT

RUN apk add --no-cache sqlite sqlite-libs bash vim curl

ENTRYPOINT ["entrypoint.sh"]
