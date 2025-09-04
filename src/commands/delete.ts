import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { IDManager } from '../utils/ids.js';
import chalk from 'chalk';

export class DeleteCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('delete')
      .alias('del')
      .description('Delete tasks')
      .argument('<ids...>', 'task IDs (short or full)')
      .option('-y, --yes', 'skip confirmation')
      .action(async (ids: string[], options) => {
        try {
          await this.execute(ids, options);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(shortIds: string[], options: { yes?: boolean }): Promise<void> {
    // Get tasks to build ID mapping
    const tasks = await this.api.getTasks();
    const tasksWithIds = IDManager.generateShortIds(tasks);

    const tasksToDelete: Array<{shortId: string, fullId: string, content: string}> = [];
    const errors: string[] = [];

    // Resolve all IDs first
    for (const shortId of shortIds) {
      try {
        const fullId = IDManager.resolveShortId(shortId);
        const task = tasks.find(t => t.id === fullId);

        if (task) {
          tasksToDelete.push({
            shortId,
            fullId,
            content: task.content,
          });
        } else {
          errors.push(`Task ${shortId} not found`);
        }
      } catch (error: any) {
        errors.push(`Invalid ID ${shortId}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.log(chalk.red(`❌ Errors:`));
      errors.forEach(error => {
        console.log(chalk.gray(`   • ${error}`));
      });
    }

    if (tasksToDelete.length === 0) {
      return;
    }

    // Show what will be deleted
    console.log(chalk.yellow(`⚠️  About to delete ${tasksToDelete.length} task(s):`));
    tasksToDelete.forEach(task => {
      console.log(chalk.gray(`   ${task.shortId}: ${task.content}`));
    });

    // Confirm deletion unless --yes flag is used
    if (!options.yes) {
      const { default: inquirer } = await import('inquirer');
      const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete these tasks?',
        default: false,
      }]);

      if (!answer.confirm) {
        console.log(chalk.gray('Deletion cancelled'));
        return;
      }
    }

    // Delete tasks
    const deleted: string[] = [];
    const deleteErrors: string[] = [];

    for (const task of tasksToDelete) {
      try {
        await this.api.deleteTask(task.fullId);
        deleted.push(task.content);
      } catch (error: any) {
        if (error.response?.status === 404) {
          deleteErrors.push(`Task ${task.shortId} not found (may have been already deleted)`);
        } else {
          deleteErrors.push(`Failed to delete ${task.shortId}: ${error.message}`);
        }
      }
    }

    // Output results
    if (deleted.length > 0) {
      console.log(chalk.green(`✅ Deleted ${deleted.length} task(s):`));
      deleted.forEach(content => {
        console.log(chalk.gray(`   • ${content}`));
      });
    }

    if (deleteErrors.length > 0) {
      console.log(chalk.red(`❌ Delete errors:`));
      deleteErrors.forEach(error => {
        console.log(chalk.gray(`   • ${error}`));
      });
    }
  }
}
