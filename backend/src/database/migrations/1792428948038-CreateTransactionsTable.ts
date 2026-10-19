import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1792428948038 implements MigrationInterface {
  name = 'CreateTransactionsTable1792428948038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(12,2) NOT NULL, \`type\` enum ('income', 'expense') NOT NULL, \`description\` varchar(255) NULL, \`transactionDate\` datetime NOT NULL, \`userId\` int NOT NULL, \`categoryId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_6bb58f2b6e30cb51a6504599f41\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_86e965e74f9cc66149cf6c90f64\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_86e965e74f9cc66149cf6c90f64\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6bb58f2b6e30cb51a6504599f41\``,
    );
    await queryRunner.query(`DROP TABLE \`transactions\``);
  }
}
