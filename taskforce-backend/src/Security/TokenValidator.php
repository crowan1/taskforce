<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;

class TokenValidator
{
    private JWTTokenManagerInterface $jwtManager;

    public function __construct(JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
    }

    public function validateToken(string $token): bool
    {
        try {
            $payload = $this->jwtManager->parse($token);
            
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false;
            }

            if (!isset($payload['username']) || !isset($payload['iat'])) {
                return false;
            }

            return true;
        } catch (JWTDecodeFailureException $e) {
            return false;
        }
    }

    public function getTokenPayload(string $token): ?array
    {
        try {
            return $this->jwtManager->parse($token);
        } catch (JWTDecodeFailureException $e) {
            return null;
        }
    }
}
