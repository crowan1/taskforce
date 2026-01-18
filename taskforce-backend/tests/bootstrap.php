<?php

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Dotenv\Exception\PathException;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    $envDir = dirname(__DIR__);
    $envFile = $envDir.'/.env';
    $envTestFile = $envDir.'/.env.test';

    try {
        if (is_file($envFile) && is_readable($envFile)) {
            (new Dotenv())->bootEnv($envFile);
        } elseif (is_file($envTestFile) && is_readable($envTestFile)) {
            (new Dotenv())->bootEnv($envTestFile);
        }
    } catch (PathException $e) {
        
    }
}

if (!empty($_SERVER['APP_DEBUG'])) {
    umask(0000);
}
