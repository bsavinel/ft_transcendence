# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: bsavinel <bsavinel@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/02/23 10:40:19 by bsavinel          #+#    #+#              #
#    Updated: 2023/02/25 15:29:24 by bsavinel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#?###########################################
#?  Regle par defaut, met e place le projet #
#?###########################################

up:
	docker-compose up

#?#######################################
#?  Regle pour lancer seulement le back #
#?#######################################

backend:
	docker-compose up backend

#?########################################
#?  Regle pour lancer seulement le front #
#?########################################

frontend:
	docker-compose up frontend

#?###################################################
#?  Regle pour construire les image dans les lancer #
#?###################################################

build:
	docker-compose build

#?##########################################
#?  Regle pour construire lancer les image #
#?##########################################

start:
	docker-compose start 

#?##############################################
#?  Regle pour construire stoper les container #
#?##############################################

stop:
	docker-compose stop 

#?################################################
#?  Regle pour construire relancer les container #
#?################################################

restart:
	docker-compose restart

#?#####################################################
#? Stop si necessaire les containers, et les detruits #
#?#####################################################

down:
	docker-compose down

#?#########################################################################
#? Stop si necessaire les containers, les detruits et detruit les volumes #
#?#########################################################################

clean:
	docker-compose down -v

#?#################################################
#? La regle clean mais en plus detruitles imgages #
#?#################################################

fclean:
	docker-compose down --rmi all -v

#?###################################
#?  Detruit entierement les images  #
#?###################################

prune: fclean
	docker system prune -af

#?#############################################################################################
#? Regle pour prisma studio vous ajouter enable apres pour le lancer ou diable pour l'arreter #
#?#############################################################################################

prismaStudio:
ifeq (enable, $(filter enable, $(MAKECMDGOALS)))
	docker-compose exec -d backend npx prisma studio
	@echo "Prisma studio is running on http://localhost:5555"
else ifeq (disable, $(filter disable, $(MAKECMDGOALS)))
	docker-compose exec -d backend killall "npm exec prisma studio"
else
	@echo "Usage: make prismaStudio [enable|disable]"
endif

#?######################################################
#? Regle pour generer ou suprimer les modules en local #
#?######################################################

module:
ifeq (create, $(filter create, $(MAKECMDGOALS)))
	(cd backend && npm install)
	(cd frontend && npm install)
else ifeq (delete, $(filter delete, $(MAKECMDGOALS)))
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
else
	@echo "Usage: make module [create|delete]"
endif
	
#?###############################################
#? Regle pour ouvrir un shell dans un container #
#?###############################################

inBack:
	docker-compose exec backend /bin/sh

inFront:
	docker-compose exec frontend /bin/sh

inDatabase:
	docker-compose exec database /bin/sh

#!################
#!     FLAGS     #
#!################

enable:
	@echo -n ""

disable:
	@echo -n ""

create:
	@echo -n ""

delete:
	@echo -n ""

.IGNORE:
.PHONY: up backend frontend build start stop restart down clean fclean prune prismaStudio module inBack inFront inDatabase enable disable create delete