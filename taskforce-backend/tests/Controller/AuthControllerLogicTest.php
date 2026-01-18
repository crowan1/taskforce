<?php

namespace App\Tests\Controller;

use App\Controller\AuthController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthControllerLogicTest extends TestCase
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;
    private JWTTokenManagerInterface $jwtManager;
    private EntityRepository $userRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->validator = $this->createMock(ValidatorInterface::class);
        $this->jwtManager = $this->createMock(JWTTokenManagerInterface::class);
        $this->userRepository = $this->createMock(EntityRepository::class);

        $this->entityManager
            ->method('getRepository')
            ->with(User::class)
            ->willReturn($this->userRepository);
    }

    private function buildController(): AuthControllerStub
    {
        return new AuthControllerStub(
            $this->entityManager,
            $this->passwordHasher,
            $this->validator,
            $this->jwtManager
        );
    }

    public function testRegisterMissingFieldsReturnsBadRequest(): void
    {
        $controller = $this->buildController();
        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com'
        ]));

        $response = $controller->register($request);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame(
            'Email, mot de passe, prénom et nom sont requis',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testRegisterEmailAlreadyExistsReturnsConflict(): void
    {
        $controller = $this->buildController();
        $existingUser = new User();

        $this->userRepository
            ->method('findOneBy')
            ->willReturn($existingUser);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'pass',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->register($request);

        $this->assertSame(409, $response->getStatusCode());
        $this->assertSame(
            'Cet email est déjà utilisé',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testRegisterValidationErrorsReturnsBadRequest(): void
    {
        $controller = $this->buildController();
        $violations = new ConstraintViolationList([
            new ConstraintViolation('Invalid email', '', [], '', 'email', 'invalid')
        ]);

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(null);

        $this->passwordHasher
            ->method('hashPassword')
            ->willReturn('hashed');

        $this->validator
            ->method('validate')
            ->willReturn($violations);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'pass',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->register($request);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame(
            'Données invalides',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testRegisterSuccessCreatesUserAndReturnsToken(): void
    {
        $controller = $this->buildController();

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(null);

        $this->passwordHasher
            ->method('hashPassword')
            ->willReturn('hashed');

        $this->validator
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->jwtManager
            ->method('create')
            ->willReturn('jwt-token');

        $this->entityManager
            ->expects($this->once())
            ->method('persist');

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'pass',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->register($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('jwt-token', $payload['token']);
        $this->assertSame('test@example.com', $payload['user']['email']);
    }

    public function testLoginMissingIdentifierReturnsBadRequest(): void
    {
        $controller = $this->buildController();
        $request = new Request([], [], [], [], [], [], json_encode([
            'password' => 'pass'
        ]));

        $response = $controller->login($request);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame(
            'Email ou username requis',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testLoginMissingPasswordReturnsBadRequest(): void
    {
        $controller = $this->buildController();
        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com'
        ]));

        $response = $controller->login($request);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame(
            'Mot de passe requis',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testLoginUserNotFoundReturnsUnauthorized(): void
    {
        $controller = $this->buildController();

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(null);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'pass'
        ]));

        $response = $controller->login($request);

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame(
            'Utilisateur non trouvé',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testLoginWrongPasswordReturnsUnauthorized(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('test@example.com');

        $this->userRepository
            ->method('findOneBy')
            ->willReturn($user);

        $this->passwordHasher
            ->method('isPasswordValid')
            ->willReturn(false);

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'bad'
        ]));

        $response = $controller->login($request);

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame(
            'Mot de passe incorrect',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testLoginSuccessSetsCookieAndReturnsToken(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('John');
        $user->setLastname('Doe');

        $this->userRepository
            ->method('findOneBy')
            ->willReturn($user);

        $this->passwordHasher
            ->method('isPasswordValid')
            ->willReturn(true);

        $this->jwtManager
            ->method('create')
            ->willReturn('jwt-token');

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'password' => 'pass'
        ]));

        $response = $controller->login($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('jwt-token', $payload['token']);
        $this->assertNotEmpty($response->headers->getCookies());
    }

    public function testGetUserProfileUnauthorized(): void
    {
        $controller = $this->buildController();
        $controller->setUser(null);

        $response = $controller->getUserProfile();

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame(
            'Utilisateur non authentifié',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testGetUserProfileReturnsUserData(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setFirstname('John');
        $user->setLastname('Doe');
        $controller->setUser($user);

        $response = $controller->getUserProfile();
        $payload = json_decode($response->getContent(), true);

        $this->assertSame('test@example.com', $payload['email']);
        $this->assertSame('John', $payload['firstname']);
        $this->assertSame('Doe', $payload['lastname']);
    }

    public function testUpdateUserProfileUnauthorized(): void
    {
        $controller = $this->buildController();
        $controller->setUser(null);
        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->updateUserProfile($request);

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame(
            'Utilisateur non authentifié',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testUpdateUserProfileEmailConflict(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('old@example.com');
        $controller->setUser($user);

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(new User());

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'new@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->updateUserProfile($request);

        $this->assertSame(409, $response->getStatusCode());
        $this->assertSame(
            'Cet email est déjà utilisé',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testUpdateUserProfileValidationError(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('test@example.com');
        $controller->setUser($user);

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(null);

        $this->validator
            ->method('validate')
            ->willReturn(new ConstraintViolationList([
                new ConstraintViolation('Invalid', '', [], '', 'email', 'invalid')
            ]));

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'test@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->updateUserProfile($request);

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame(
            'Données invalides',
            json_decode($response->getContent(), true)['message']
        );
    }

    public function testUpdateUserProfileSuccess(): void
    {
        $controller = $this->buildController();
        $user = new User();
        $user->setEmail('old@example.com');
        $controller->setUser($user);

        $this->userRepository
            ->method('findOneBy')
            ->willReturn(null);

        $this->validator
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $request = new Request([], [], [], [], [], [], json_encode([
            'email' => 'new@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe'
        ]));

        $response = $controller->updateUserProfile($request);
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('new@example.com', $payload['user']['email']);
    }
}

class AuthControllerStub extends AuthController
{
    private ?UserInterface $user = null;

    public function setUser(?UserInterface $user): void
    {
        $this->user = $user;
    }

    protected function getUser(): ?UserInterface
    {
        return $this->user;
    }
}
