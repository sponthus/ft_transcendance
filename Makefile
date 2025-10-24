NETWORK = pongnet

NGINX_DIR = nginx
FRONTEND_DIR = frontend
USERS_DIR = user-service
UPLOAD_DIR = upload-service
GAMES_DIR = game-service
API_DIR = api-gateway
SESSIONS_DIR = session-service

USERS_DB_NAME = users.db
GAMES_DB_NAME = games.db
USERS_DB = $(USERS_DIR)/$(USERS_DB_NAME)
GAMES_DB = $(GAMES_DIR)/$(GAMES_DB_NAME)

DB = $(USERS_DB) \
    $(GAMES_DB)

ENV = .env

COMPOSE_FILE = ./docker-compose.yml

all: $(ENV) clean build

$(ENV): env

env:
	@if [ ! -f "$(ENV)" ]; then \
		echo " ✘ No .env found"; \
		sh config/init_env.sh; \
	fi
	@echo " ✔ .env present"

re: clean all

dev: env
	sh config/change_mode.sh NODE_ENV development
	$(MAKE) down
	$(MAKE) build

prod: env
	sh config/change_mode.sh NODE_ENV production
	$(MAKE) down
	$(MAKE) build

build:
	docker compose -f $(COMPOSE_FILE) up --build

up:
	docker compose -f $(COMPOSE_FILE) up

down: clean-dist
	docker compose -f $(COMPOSE_FILE) down

ps:
	docker compose -f $(COMPOSE_FILE) ps

clean: clean-dist clean-modules
	docker compose -f $(COMPOSE_FILE) down --rmi all -v --remove-orphans

fclean: clean clean-db
	@echo "⑤ Deep clean = Prune :";
	@echo " ✔ Images";
	@docker image prune -f
	@echo " ✔ Volumes";
	@docker volume prune -f
	@echo " ✔ Network";
	@docker network prune -f
	@echo " ✔ Builder";
	@docker builder prune -f
	@echo " ✔ System";
	@docker system prune -a -f --volumes

clean-machine:
	docker stop $$(docker ps -qa)
	docker rm $$(docker ps -qa)
	docker rmi -f $$(docker images -qa)
	docker volume rm $$(docker volume ls -q)
	docker network rm $$(docker network ls -q)

clean-db:
	@rm -f $(DB)
	@echo " ✔ DB deleted";

clean-dist:
	@rm -rf $(FRONTEND_DIR)/dist
	@echo " ✔ Frontend dist deleted";

clean-modules:
	@rm -rf $(FRONTEND_DIR)/node_modules \
		$(USERS_DIR)/node_modules \
		$(UPLOAD_DIR)/node_modules \
		$(GAMES_DIR)/node_modules \
		$(API_DIR)/node_modules \
		$(SESSIONS_DIR)/node_modules
	@rm -f $(FRONTEND_DIR)/package-lock.json \
    	$(USERS_DIR)/package-lock.json \
    	$(UPLOAD_DIR)/package-lock.json \
    	$(GAMES_DIR)/package-lock.json \
    	$(API_DIR)/package-lock.json
	@echo " ✔ Node modules deleted";

clean-env:
	@rm .env
	@rm -r secrets

.PHONY: all re clean fclean down up build ps clean-machine env clean-dist clean-modules clean-db clean-env dev prod