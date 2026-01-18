<?php

namespace App\Tests\Security;

use App\Security\TokenValidator;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use PHPUnit\Framework\TestCase;

class TokenValidatorTest extends TestCase
{
    public function testValidateTokenReturnsTrueForValidPayload(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager->method('parse')->willReturn([
            'exp' => time() + 3600,
            'username' => 'user@example.com',
            'iat' => time() - 10
        ]);

        $validator = new TokenValidator($jwtManager);

        $this->assertTrue($validator->validateToken('valid-token'));
    }

    public function testValidateTokenReturnsFalseForExpiredToken(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager->method('parse')->willReturn([
            'exp' => time() - 10,
            'username' => 'user@example.com',
            'iat' => time() - 3600
        ]);

        $validator = new TokenValidator($jwtManager);

        $this->assertFalse($validator->validateToken('expired-token'));
    }

    public function testValidateTokenReturnsFalseWhenPayloadMissingFields(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager->method('parse')->willReturn([
            'exp' => time() + 3600
        ]);

        $validator = new TokenValidator($jwtManager);

        $this->assertFalse($validator->validateToken('missing-fields-token'));
    }

    public function testValidateTokenReturnsFalseOnDecodeFailure(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager
            ->method('parse')
            ->willThrowException(
                new JWTDecodeFailureException(JWTDecodeFailureException::INVALID_TOKEN, 'Invalid token')
            );

        $validator = new TokenValidator($jwtManager);

        $this->assertFalse($validator->validateToken('invalid-token'));
    }

    public function testGetTokenPayloadReturnsPayload(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager->method('parse')->willReturn(['username' => 'user@example.com']);

        $validator = new TokenValidator($jwtManager);

        $this->assertSame(['username' => 'user@example.com'], $validator->getTokenPayload('token'));
    }

    public function testGetTokenPayloadReturnsNullOnDecodeFailure(): void
    {
        $jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $jwtManager
            ->method('parse')
            ->willThrowException(
                new JWTDecodeFailureException(JWTDecodeFailureException::INVALID_TOKEN, 'Invalid token')
            );

        $validator = new TokenValidator($jwtManager);

        $this->assertNull($validator->getTokenPayload('token'));
    }
}
