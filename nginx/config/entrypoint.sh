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
	envsubst '${GAME_WS_PORT} ${SESSION_WS_PORT} ${API_PORT} ${DOMAIN_NAME}' < /etc/nginx/nginx.development.conf.template > /etc/nginx/nginx.conf
	PREFIX="http"
else
	envsubst '${GAME_WS_PORT} ${SESSION_WS_PORT} ${API_PORT} ${DOMAIN_NAME}' < /etc/nginx/nginx.production.conf.template > /etc/nginx/nginx.conf
	PREFIX="https"
fi

mkdir -p /etc/nginx/sites-enabled

if [ ! -f /etc/ssl/$DOMAIN_NAME.key ]; then
    openssl genpkey -algorithm RSA -out /etc/ssl/$DOMAIN_NAME.key
	echo "Key generated"
fi

if [ ! -f /etc/ssl/$DOMAIN_NAME.crt ]; then
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

# Wait for services to be up

until curl -ks ${PREFIX}://api-gateway:${API_PORT}/health; do
  echo "Waiting for api-gateway..."
  sleep 10
done

until curl -ks ${PREFIX}://user-service:${USER_PORT}/health; do
  echo "Waiting for user-service..."
  sleep 10
done

until curl -ks ${PREFIX}://game-service:${GAME_PORT}/health; do
  echo "Waiting for game-service..."
  sleep 10
done

until curl -ks ${PREFIX}://session-service:${SESSION_PORT}/health; do
  echo "Waiting for session-service..."
  sleep 10
done

echo "\nAll services are up, launching nginx"

nginx -g "daemon off;"
