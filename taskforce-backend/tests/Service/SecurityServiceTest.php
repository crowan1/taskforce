<?php

namespace App\Tests\Service;

use App\Service\SecurityService;
use PHPUnit\Framework\TestCase;

class SecurityServiceTest extends TestCase
{
    public function testSanitizeEmailLowercasesAndTrims(): void
    {
        $service = new SecurityService();

        $this->assertSame('test@example.com', $service->sanitizeEmail('  TeSt@Example.COM  '));
    }

    public function testSanitizeEmailNullReturnsNull(): void
    {
        $service = new SecurityService();

        $this->assertNull($service->sanitizeEmail(null));
    }

    public function testValidateEmailReturnsTrueForValidEmail(): void
    {
        $service = new SecurityService();

        $this->assertTrue($service->validateEmail('valid@example.com'));
    }

    public function testValidateEmailReturnsFalseForInvalidEmail(): void
    {
        $service = new SecurityService();

        $this->assertFalse($service->validateEmail('not-an-email'));
    }

    public function testValidateStringLengthHonorsBounds(): void
    {
        $service = new SecurityService();

        $this->assertTrue($service->validateStringLength('abcd', 3, 5));
        $this->assertFalse($service->validateStringLength('ab', 3, 5));
        $this->assertFalse($service->validateStringLength('abcdef', 3, 5));
    }

    public function testValidateEmailNullReturnsFalse(): void
    {
        $service = new SecurityService();

        $this->assertFalse($service->validateEmail(null));
    }

    public function testValidateStringLengthNullReturnsFalse(): void
    {
        $service = new SecurityService();

        $this->assertFalse($service->validateStringLength(null, 1, 5));
    }
}
