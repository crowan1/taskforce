<?php

namespace App\Service;

class SecurityService
{
    public function sanitizeEmail(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }
        
        $email = trim(strtolower($email));
        return filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    public function validateEmail(?string $email): bool
    {
        if ($email === null) {
            return false;
        }
        
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function validateStringLength(?string $value, int $min = 0, int $max = 255): bool
    {
        if ($value === null) {
            return false;
        }
        
        $length = mb_strlen($value, 'UTF-8');
        return $length >= $min && $length <= $max;
    }
}

