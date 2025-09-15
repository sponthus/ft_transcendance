FROM node:20-alpine

COPY    ./config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN		chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app
#COPY ./src/index.js ./

ARG API_PORT
ENV API_PORT=${API_PORT}

EXPOSE $API_PORT

ENTRYPOINT ["entrypoint.sh"]
