FROM node:20-alpine

COPY ./config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

RUN mkdir app

# TODO Ajout de bash, sqlite3... pour faire des tests dans le docker
RUN apk add --no-cache sqlite sqlite-libs bash vim curl

WORKDIR /app

ENTRYPOINT ["entrypoint.sh"]
