<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250818201222 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users DROP FOREIGN KEY FK_7D6AC77A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users DROP FOREIGN KEY FK_7D6AC77166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD id INT AUTO_INCREMENT NOT NULL, ADD role VARCHAR(20) NOT NULL, ADD joined_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', DROP PRIMARY KEY, ADD PRIMARY KEY (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD CONSTRAINT FK_7D6AC77A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD CONSTRAINT FK_7D6AC77166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users MODIFY id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users DROP FOREIGN KEY FK_7D6AC77166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users DROP FOREIGN KEY FK_7D6AC77A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX `PRIMARY` ON project_users
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users DROP id, DROP role, DROP joined_at
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD CONSTRAINT FK_7D6AC77166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD CONSTRAINT FK_7D6AC77A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE project_users ADD PRIMARY KEY (project_id, user_id)
        SQL);
    }
}
