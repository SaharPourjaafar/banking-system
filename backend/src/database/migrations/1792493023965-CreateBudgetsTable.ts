import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBudgetsTable1792493023965 implements MigrationInterface {
  name = 'CreateBudgetsTable1792493023965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`budgets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(12,2) NOT NULL, \`startDate\` date NOT NULL, \`endDate\` date NOT NULL, \`userId\` int NOT NULL, \`categoryId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_27e688ddf1ff3893b43065899f9\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_3ece6e1292b7a86ba82145775a7\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_3ece6e1292b7a86ba82145775a7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_27e688ddf1ff3893b43065899f9\``,
    );
    await queryRunner.query(`DROP TABLE \`budgets\``);
  }
}
