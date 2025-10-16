#!/bin/bash

echo "------- Creation of your environment ------"
echo "-------------------------------------------"

SCRIPT_DIR="$(cd "$(dirname "$0")" &>/dev/null && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../" &>/dev/null && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
SECRETS_DIR="$PROJECT_ROOT/secrets"

mkdir -p "$SECRETS_DIR"

generate_rand() {
    local rand_file="$1"
    local rand=$(openssl rand -hex 8)
    echo "$rand" > "$SECRETS_DIR/$rand_file"
    echo "$rand"
}

store_secret() {
    local file="$1"
    local content="$2"
    echo "$content" > "$SECRETS_DIR/$file"
    echo "$content"
}


validate_num_choice() {
  local choice="$1"
  if [ -z "$choice" ]; then
  		echo "This field can't be empty." >&2
          return 1
  	fi
  	if ! echo "$choice" | grep -qE '^[12]{1}+$'; then
          echo "This field can only contain 1 or 2." >&2
          return 1
    fi
  return 0
}

chose_mode() {
    local prompt="$1"
    local validation_func="$2"
    local input

    while true; do
      read -p "$prompt" input
      if [ -z "$validation_func" ]; then
        echo "$input"
        return 0 # If no validation function available, is ok
      else
        if $validation_func "$input"; then
          if echo "$input" | grep -qE '^[1]{1}+$'; then
            echo "development"
          else
            echo "production"
          fi
          return 0 # Or calls the validation function
        fi
      fi
    done
}

VITE_PORT=5173
API_PORT=3000
USER_PORT=3001
GAME_PORT=3002
UPLOAD_PORT=3003
SESSION_PORT=3004
GAME_WS_PORT=4000
SESSION_WS_PORT=5000
DOMAIN_NAME=localhost
IP=0.0.0.0

HASH_KEY=$(generate_rand "hash_key.txt")
API_KEY=$(generate_rand "api_key.txt")
AUTH_KEY=$(generate_rand "auth_key.txt")
COOKIE_KEY=$(generate_rand "cookie_key.txt")
GIT_SECRET=$(store_secret "git_secret.txt" "230f856441da9b0a7cf75b3797dcf84b24a1bc7b")
GIT_ID=$(store_secret "git_id.txt" "Ov23lijqBPrCzLQcc0wp")

NODE_ENV=$(chose_mode "Chose dev mode (1) or production mode (2) : " validate_num_choice)

cat > "$ENV_FILE" << EOF
NODE_ENV=$NODE_ENV
LOG_LEVEL=info
DOMAIN_NAME=$DOMAIN_NAME
IP=$IP
VITE_PORT=$VITE_PORT
API_PORT=$API_PORT
USER_PORT=$USER_PORT
GAME_PORT=$GAME_PORT
UPLOAD_PORT=$UPLOAD_PORT
SESSION_PORT=$SESSION_PORT
GAME_WS_PORT=$GAME_WS_PORT
SESSION_WS_PORT=$SESSION_WS_PORT
VITE_IP=$IP
VITE_DOMAIN_NAME=localhost
VITE_API_PORT=$API_PORT
EOF

echo "-------------------------------------------"
echo " -> Done"
echo ".env has been created in : $ENV_FILE"
echo "Secrets generated in : $SECRETS_DIR"
echo "-------------------------------------------"
