FROM node:20-alpine

COPY    ./config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

RUN mkdir app
WORKDIR /app

ARG WS_PORT
ENV WS_PORT=${WS_PORT}

EXPOSE $WS_PORT

ENTRYPOINT ["entrypoint.sh"]
