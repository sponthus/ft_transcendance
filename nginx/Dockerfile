# FROM node:20-alpine AS frontend-build

# RUN mkdir app

# COPY ./frontend ./app
# COPY ./config/env.js /app/config/env.js
# COPY ./config/logger.js /app/config/logger.js

# RUN		chmod +x /usr/local/bin/entrypoint.sh

# WORKDIR /app

# ENTRYPOINT ["entrypoint.sh"]

# Multistage dockerfile possibility, nginx to serve the frontend static files

FROM nginx:stable

RUN apt update -y \
	&& apt install -y \
	nginx \
	openssl

# COPY    --from=frontend-build /app/public /usr/share/nginx/html/public
# COPY    --from=frontend-build /app/index.html /usr/share/nginx/html/index.html
# COPY    --from=frontend-build /app/postcss.config.js /usr/share/nginx/html/postcss.config.js
# COPY    --from=frontend-build /app/tailwind.config.js /usr/share/nginx/html/tailwind.config.js
# COPY    --from=frontend-build /app/dist /usr/share/nginx/html/dist
COPY    ./config/nginx.development.conf.template /etc/nginx/nginx.development.conf.template
COPY    ./config/nginx.production.conf.template /etc/nginx/nginx.production.conf.template
COPY    ./config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

EXPOSE	443
EXPOSE	80

ENTRYPOINT ["entrypoint.sh"]