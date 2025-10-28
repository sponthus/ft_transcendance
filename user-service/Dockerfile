FROM node:20-alpine

RUN mkdir app

# In dev = volumes
COPY ./user-service /app
COPY ./config/env.js /app/config/env.js
COPY ./config/logger.js /app/config/logger.js

COPY ./user-service/config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

# Ajout de bash, sqlite3... pour faire des tests dans le docker
RUN apk add --no-cache sqlite sqlite-libs bash vim curl

WORKDIR /app

ENTRYPOINT ["entrypoint.sh"]
