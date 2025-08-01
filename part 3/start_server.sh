#!/bin/bash
echo "🚀 Démarrage du serveur HBnB..."
cd "/home/wgomis/holbertonschool-hbnb/part 3"

# Créer l'utilisateur de test
echo "📝 Création de l'utilisateur de test..."
python3 create_user.py

# Démarrer le serveur
echo "🌐 Démarrage du serveur Flask sur http://localhost:5000"
python3 run.py
