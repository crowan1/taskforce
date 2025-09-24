#!/bin/bash

# Fichier de verrouillage pour éviter la réinitialisation
LOCK_FILE="/tmp/taskforce_initialized"

# Si déjà initialisé, on skip
if [ -f "$LOCK_FILE" ]; then
    echo "✅ TaskForce déjà initialisé, démarrage des services..."
    exit 0
fi

# Script d'initialisation automatique pour TaskForce
echo "🚀 Initialisation de TaskForce..."

# Attendre que MySQL soit prêt
echo "⏳ Attente de la base de données..."
until php bin/console doctrine:database:create --if-not-exists --no-interaction 2>/dev/null; do
    echo "   Base de données pas encore prête, attente..."
    sleep 2
done

echo "✅ Base de données prête !"

# Exécuter les migrations
echo "📦 Exécution des migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction || echo "⚠️ Pas de migrations à exécuter"

# Créer une migration si aucune n'existe
if [ ! "$(ls -A migrations/)" ]; then
    echo "🔧 Création de la migration initiale..."
    php bin/console doctrine:migrations:diff || echo "⚠️ Erreur lors de la création de la migration"
    php bin/console doctrine:migrations:migrate --no-interaction || echo "⚠️ Erreur lors de l'exécution de la migration"
fi

# Insérer les rôles par défaut
echo "👥 Insertion des rôles par défaut..."
php bin/console app:insert-roles || echo "⚠️ Erreur lors de l'insertion des rôles (peut-être déjà existants)"

# Marquer comme initialisé
touch "$LOCK_FILE"

echo "✅ Initialisation terminée !"
