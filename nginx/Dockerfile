FROM nginx:stable

RUN apt update -y \
	&& apt install -y \
	nginx \
	openssl

COPY    ./config/nginx.development.conf.template /etc/nginx/nginx.development.conf.template
COPY    ./config/nginx.production.conf.template /etc/nginx/nginx.production.conf.template
COPY    ./config/entrypoint.sh /usr/local/bin/
RUN		chmod +x /usr/local/bin/entrypoint.sh

EXPOSE	443
EXPOSE	80

ENTRYPOINT ["entrypoint.sh"]