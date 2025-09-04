import { Command } from 'commander';
import { BaseCommand } from './base.js';
import chalk from 'chalk';

export class SyncCommand extends BaseCommand {
  createCommand(): Command {
    return new Command('sync')
      .description('Force sync with Todoist')
      .action(async () => {
        try {
          await this.execute();
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  private async execute(): Promise<void> {
    console.log(chalk.blue('🔄 Syncing with Todoist...'));

    try {
      await this.api.sync();
      console.log(chalk.green('✅ Sync completed successfully'));
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error(chalk.red('❌ Authentication failed. Please check your API token.'));
      } else if (error.code === 'ENOTFOUND') {
        console.error(chalk.red('❌ Network error. Please check your internet connection.'));
      } else {
        console.error(chalk.red(`❌ Sync failed: ${error.message}`));
      }
    }
  }
}
