FROM node:20-alpine

COPY    ./config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

RUN mkdir app
WORKDIR /app

ARG API_PORT
ENV API_PORT=${API_PORT}

EXPOSE 3004
EXPOSE 5000

ENTRYPOINT ["entrypoint.sh"]
