<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250814125049 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE task_required_skills (task_id INT NOT NULL, skill_id INT NOT NULL, INDEX IDX_C697F44B8DB60186 (task_id), INDEX IDX_C697F44B5585C142 (skill_id), PRIMARY KEY(task_id, skill_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_required_skills ADD CONSTRAINT FK_C697F44B8DB60186 FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_required_skills ADD CONSTRAINT FK_C697F44B5585C142 FOREIGN KEY (skill_id) REFERENCES skill (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE task_required_skills DROP FOREIGN KEY FK_C697F44B8DB60186
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task_required_skills DROP FOREIGN KEY FK_C697F44B5585C142
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE task_required_skills
        SQL);
    }
}
