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
API_SERVICE=api-gateway
USER_PORT=3001
USER_SERVICE=user-service
GAME_PORT=3002
GAME_SERVICE=game-service
UPLOAD_PORT=3003
UPLOAD_SERVICE=upload-service

HASH_KEY=$(generate_rand "hash_key.txt")
API_KEY=$(generate_rand "api_key.txt")

NODE_ENV=$(chose_mode "Chose dev mode (1) or production mode (2) : " validate_num_choice)

cat > "$ENV_FILE" << EOF
NODE_ENV=$NODE_ENV
VITE_PORT=$VITE_PORT
API_PORT=$API_PORT
API_SERVICE=$API_SERVICE
USER_PORT=$USER_PORT
USER_SERVICE=$USER_SERVICE
GAME_PORT=$GAME_PORT
GAME_SERVICE=$GAME_SERVICE
UPLOAD_PORT=$UPLOAD_PORT
UPLOAD_SERVICE=$UPLOAD_SERVICE
EOF

echo "-------------------------------------------"
echo " -> Done"
echo ".env has been created in : $ENV_FILE"
echo "Secrets generated in : $SECRETS_DIR"
echo "-------------------------------------------"