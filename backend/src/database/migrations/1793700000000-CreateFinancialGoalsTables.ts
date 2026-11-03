import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFinancialGoalsTables1793700000000 implements MigrationInterface {
  name = 'CreateFinancialGoalsTables1793700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`financial_goals\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(100) NOT NULL,
        \`targetAmount\` decimal(12,2) NOT NULL,
        \`deadline\` date NOT NULL,
        \`description\` text NULL,
        \`status\` enum('active','completed') NOT NULL DEFAULT 'active',
        \`userId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`goal_contributions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`amount\` decimal(12,2) NOT NULL,
        \`contributionDate\` date NOT NULL,
        \`note\` text NULL,
        \`goalId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`financial_goals\`
       ADD CONSTRAINT \`FK_financial_goals_user\`
       FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`)
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE \`goal_contributions\`
       ADD CONSTRAINT \`FK_goal_contributions_goal\`
       FOREIGN KEY (\`goalId\`) REFERENCES \`financial_goals\`(\`id\`)
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`goal_contributions\`
       DROP FOREIGN KEY \`FK_goal_contributions_goal\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`financial_goals\`
       DROP FOREIGN KEY \`FK_financial_goals_user\``,
    );

    await queryRunner.query(`DROP TABLE \`goal_contributions\``);
    await queryRunner.query(`DROP TABLE \`financial_goals\``);
  }
}
