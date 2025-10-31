#!/bin/bash
# gitinit.sh

# fullname="USER INPUT"
read -p "Nom du repertoire git: " "dirname"
git init
git remote add origin https://github.com/AJB1000/$dirname.git
git add .
git commit -m "Déploiement initial"
git push -u origin master