#!/bin/sh

# Generating a self signed certificate
# -x509 = self signed
# -out = certificate file
# -key = key file
# -subj = mandatory, subject describes ID that emits certificate
#  CN (Common Name) is mandatory because checked by the client when establishing HTTPS
#  O (Operation) name of structure or entity
#  ST (state)
#  C (country)
# -nodes = no passphrase


if env | grep -q "^NODE_ENV=development"; then
	envsubst '${GAME_WS_PORT} ${API_PORT} ${DOMAIN_NAME} ${GAME_SERVICE} ${API_SERVICE}' < /etc/nginx/nginx.development.conf.template > /etc/nginx/nginx.conf
	rm /etc/nginx/nginx.production.conf.template
else
	envsubst '${GAME_WS_PORT} ${API_PORT} ${DOMAIN_NAME} ${GAME_SERVICE} ${API_SERVICE}' < /etc/nginx/nginx.production.conf.template > /etc/nginx/nginx.conf
	rm /etc/nginx/nginx.development.conf.template
fi

# tail -f

mkdir -p /etc/nginx/sites-enabled

if [ ! -f /etc/ssl/$DOMAIN_NAME.key ]; then
    openssl genpkey -algorithm RSA -out /etc/ssl/$DOMAIN_NAME.key
	echo "Key generated"
fi

if [ ! -f /etc/ssl/transcendance.crt ]; then
    openssl req -newkey rsa:4096 \
	-nodes \
	-x509 \
	-key /etc/ssl/$DOMAIN_NAME.key \
	-out /etc/ssl/$DOMAIN_NAME.crt \
	-subj "/C=FR/ST=Lyon/O=42/UID=transcendance/CN=$DOMAIN_NAME"
	echo "Self-signed certificate generated"
	echo "include /etc/nginx/sites-available/$DOMAIN_NAME.conf;" > /etc/nginx/sites-enabled/$DOMAIN_NAME.conf
fi

# Daemon : Nginx would launch in daemon mode, in the background
# but he is the main process and should stay front otherwise the container would stop
# -g : Allow ability to give global directions in command lines, taking over nginx.conf

#chmod -R 755 /app/uploads

echo "Launching nginx"

nginx -g "daemon off;"
