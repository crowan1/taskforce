# TaskForce - Démarrage tests

### Front-END
```bash
cd taskforce-frontend
npm test -- --coverage --watchAll=false
```

### Back-END
```bash
cd taskforce-backend
XDEBUG_MODE=coverage php bin/phpunit --coverage-text
```

 