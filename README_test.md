# TaskForce - Démarrage tests

### Front-END
```bash
cd taskforce-frontend
npm run test:ci
```

### Back-END
```bash
cd taskforce-backend
XDEBUG_MODE=coverage /opt/homebrew/bin/php bin/phpunit --coverage-text
```
