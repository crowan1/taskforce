<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    $envDir = dirname(__DIR__);
    $envFile = $envDir.'/.env';
    $envTestFile = $envDir.'/.env.test';

    if (is_file($envFile)) {
        (new Dotenv())->bootEnv($envFile);
    } elseif (is_file($envTestFile)) {
        (new Dotenv())->bootEnv($envTestFile);
    }
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}
