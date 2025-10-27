FROM node:20-alpine

RUN mkdir app

# Un-comment me for prod, in dev = volumes
# COPY ./api-gateway /app
COPY ./config/env.js /app/config/env.js
COPY ./config/logger.js /app/config/logger.js

COPY    ./api-gateway/config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN		chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

ARG API_PORT
ENV API_PORT=${API_PORT}

EXPOSE $API_PORT

ENTRYPOINT ["entrypoint.sh"]
