FROM node:20-alpine

RUN mkdir app

# Un-comment me for prod, in dev = volumes
# COPY ./session-service /app
# COPY ./config/env.js /app/config/env.js
# COPY ./config/logger.js /app/config/logger.js

COPY    ./session-service/config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

ARG WS_PORT
ENV WS_PORT=${WS_PORT}

EXPOSE $WS_PORT

ENTRYPOINT ["entrypoint.sh"]
