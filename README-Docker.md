# TaskForce - Démarrage Docker

## Comment démarrer le projet

### 1. Cloner le projet
```bash
git clone https://github.com/crowan1/taskforce
cd taskforce
```

### 2. Démarrer avec Docker
```bash
docker-compose up -d
```

### 3. C'est tout ! 

🎉 **L'initialisation se fait automatiquement** :
- ✅ Migrations Doctrine exécutées
- ✅ Rôles par défaut créés (Collaborateur, Manager, Responsable Projet)
- ✅ Base de données prête à l'emplo

Accédez à votre application :don
- **Application** : http://localhost:3000
- **API Backend** : http://localhost:8000
- **Base de données** : http://localhost:8088 (phpMyAdmin)
- **MySQL direct** : localhost:2920


### Nettoyer et redémarrer
```bash
# Si ça marche pas
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

