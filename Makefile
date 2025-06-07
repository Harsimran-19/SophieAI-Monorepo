.PHONY: help build up down restart logs ps clean prune frontend-shell api-shell

default: help

help: ## Show this help
	@echo "\nUsage: make [target]\n"
	@echo "Targets:"
	@grep -E "^[a-zA-Z_-]+:.*?## .*$$" $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all services
	docker-compose build

build-frontend: ## Build only the frontend service
	docker-compose build frontend

build-api: ## Build only the api service
	docker-compose build api

up: ## Start all services in detached mode
	docker-compose up -d

up-frontend: ## Start only the frontend service
	docker-compose up -d frontend

up-api: ## Start only the api service
	docker-compose up -d api

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-frontend: ## View logs from frontend service
	docker-compose logs -f frontend

logs-api: ## View logs from api service
	docker-compose logs -f api

ps: ## List running services
	docker-compose ps

clean: ## Remove containers, networks, and volumes
	docker-compose down --remove-orphans --volumes

prune: ## Remove all unused containers, networks, images, and volumes
	docker system prune -af --volumes

frontend-shell: ## Open a shell in the frontend container
	docker-compose exec frontend /bin/sh

api-shell: ## Open a shell in the api container
	docker-compose exec api /bin/bash

deploy: ## Build and deploy all services
	docker-compose build
	docker-compose up -d
	make restart