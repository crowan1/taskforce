<?php

namespace App\Service {
    function is_writable(string $path): bool
    {
        return !($GLOBALS['__force_not_writable'] ?? false);
    }
}

namespace App\Tests\Service {

use App\Service\ImageUploadService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\AsciiSlugger;

class ImageUploadServiceTest extends TestCase
{
    private ?string $tempUploadDir = null;

    protected function tearDown(): void
    {
        if ($this->tempUploadDir && is_dir($this->tempUploadDir)) {
            $this->removeDirectory($this->tempUploadDir);
        }
    }

    public function testUploadImageCreatesFileAndReturnsPath(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $this->tempUploadDir = sys_get_temp_dir() . '/taskforce-upload-' . uniqid();
        mkdir($this->tempUploadDir, 0755, true);

        $this->setPrivateProperty($service, 'uploadDir', $this->tempUploadDir);

        $tmpFile = tempnam(sys_get_temp_dir(), 'upload');
        file_put_contents($tmpFile, 'image-bytes');

        $uploadedFile = new UploadedFile(
            $tmpFile,
            'My Image.png',
            'image/png',
            null,
            true
        );

        $relativePath = $service->uploadImage($uploadedFile, 123);

        $this->assertStringStartsWith('uploads/tasks/123/', $relativePath);

        $expectedFile = $this->tempUploadDir . '/tasks/123/' . basename($relativePath);
        $this->assertFileExists($expectedFile);
    }

    public function testUploadImageThrowsWhenDirectoryNotWritable(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $this->tempUploadDir = sys_get_temp_dir() . '/taskforce-upload-' . uniqid();
        mkdir($this->tempUploadDir, 0755, true);

        $taskDir = $this->tempUploadDir . '/tasks/999';
        mkdir($taskDir, 0555, true);
        chmod($taskDir, 0000);

        $this->setPrivateProperty($service, 'uploadDir', $this->tempUploadDir);

        $uploadedFile = $this->createMock(UploadedFile::class);
        $uploadedFile->method('getClientOriginalName')->willReturn('image.png');
        $uploadedFile->method('guessExtension')->willReturn('png');

        $GLOBALS['__force_not_writable'] = true;
        try {
            $this->expectException(\Exception::class);
            $service->uploadImage($uploadedFile, 999);
        } finally {
            $GLOBALS['__force_not_writable'] = false;
        }
    }

    public function testUploadImageThrowsWhenFileMissingAfterMove(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $this->tempUploadDir = sys_get_temp_dir() . '/taskforce-upload-' . uniqid();
        mkdir($this->tempUploadDir, 0755, true);

        $this->setPrivateProperty($service, 'uploadDir', $this->tempUploadDir);

        $tmpFile = tempnam(sys_get_temp_dir(), 'upload');
        file_put_contents($tmpFile, 'image-bytes');

        $uploadedFile = $this->createMock(UploadedFile::class);
        $uploadedFile->method('getClientOriginalName')->willReturn('image.png');
        $uploadedFile->method('guessExtension')->willReturn('png');
        $uploadedFile->method('move')->willReturn(new \Symfony\Component\HttpFoundation\File\File($tmpFile));

        $this->expectException(\Exception::class);
        $service->uploadImage($uploadedFile, 555);
    }

    public function testUploadImageThrowsWhenMkdirFails(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $tmpFile = tempnam(sys_get_temp_dir(), 'upload-dir');
        file_put_contents($tmpFile, 'not-a-dir');

        $this->setPrivateProperty($service, 'uploadDir', $tmpFile);

        $uploadedFile = $this->createMock(UploadedFile::class);
        $uploadedFile->method('getClientOriginalName')->willReturn('image.png');
        $uploadedFile->method('guessExtension')->willReturn('png');

        $this->expectException(\Exception::class);
        $service->uploadImage($uploadedFile, 777);
    }

    public function testDeleteImageRemovesFile(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $publicDir = dirname(__DIR__, 2) . '/public';
        $filePath = $publicDir . '/test-delete.txt';

        file_put_contents($filePath, 'delete me');

        $this->assertFileExists($filePath);
        $this->assertTrue($service->deleteImage('test-delete.txt'));
        $this->assertFileDoesNotExist($filePath);
    }

    public function testDeleteImageReturnsFalseWhenMissing(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $this->assertFalse($service->deleteImage('missing-file.txt'));
    }

    public function testGetImageUrlAddsLeadingSlash(): void
    {
        $slugger = new AsciiSlugger();
        $service = new ImageUploadService($slugger);

        $this->assertSame('/uploads/tasks/1/file.png', $service->getImageUrl('uploads/tasks/1/file.png'));
    }

    private function setPrivateProperty(object $object, string $property, mixed $value): void
    {
        $reflection = new \ReflectionClass($object);
        $prop = $reflection->getProperty($property);
        $prop->setAccessible(true);
        $prop->setValue($object, $value);
    }

    private function removeDirectory(string $directory): void
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {
            if ($item->isDir()) {
                @chmod($item->getPathname(), 0755);
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        @chmod($directory, 0755);
        rmdir($directory);
    }
}
}
