<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class ImageUploadService
{
    private string $uploadDir;
    private SluggerInterface $slugger;

    public function __construct(SluggerInterface $slugger)
    {
        $this->uploadDir = dirname(__DIR__, 2) . '/public/uploads';
        $this->slugger = $slugger;
    }

    public function uploadImage(UploadedFile $file, int $taskId): string
    {
        try { 
            $taskUploadDir = $this->uploadDir . '/tasks/' . $taskId;
            if (!is_dir($taskUploadDir)) {
                if (!mkdir($taskUploadDir, 0755, true)) {
                    throw new \Exception("Impossible de créer le dossieer: " . $taskUploadDir);
                }
            }
 
            if (!is_writable($taskUploadDir)) {
                throw new \Exception("Le dossier n'est pas accessible en écriture: " . $taskUploadDir);
            }
 
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $fileName = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();
 
            $file->move($taskUploadDir, $fileName);
 
            $fullPath = $taskUploadDir . '/' . $fileName;
            if (!file_exists($fullPath)) {
                throw new \Exception("Le fichier n'a pas été créé: " . $fullPath);
            }
 
            return 'uploads/tasks/' . $taskId . '/' . $fileName;
        } catch (\Exception $e) {
            throw new \Exception("rrreur lors de l'upload: " . $e->getMessage());
        }
    }

    public function deleteImage(string $imagePath): bool
    {
        $publicDir = dirname(__DIR__, 2) . '/public';
        $relativePath = ltrim($imagePath, '/');
        $fullPath = $publicDir . '/' . $relativePath;

        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }

    public function getImageUrl(string $imagePath): string
    {
        return '/' . ltrim($imagePath, '/');
    }
}
