import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { OutputFormatter } from '../utils/formatters.js';
import chalk from 'chalk';

export class LabelsCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('labels')
      .description('Manage labels')
      .action(() => {
        // Default action - show help
        cmd.help();
      });

    cmd.addCommand(this.createListCommand());
    cmd.addCommand(this.createAddCommand());
    cmd.addCommand(this.createDeleteCommand());

    return this.setupGlobalOptions(cmd);
  }

  private createListCommand(): Command {
    return new Command('list')
      .alias('ls')
      .description('List all labels')
      .action(async (options) => {
        try {
          await this.executeList(options);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  private createAddCommand(): Command {
    return new Command('add')
      .description('Create a new label')
      .argument('<name>', 'label name')
      .action(async (name: string) => {
        try {
          await this.executeAdd(name);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  private createDeleteCommand(): Command {
    return new Command('delete')
      .alias('del')
      .description('Delete a label')
      .argument('<name>', 'label name or ID')
      .option('-y, --yes', 'skip confirmation')
      .action(async (identifier: string, options) => {
        try {
          await this.executeDelete(identifier, options);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  private async executeList(options: any): Promise<void> {
    const labels = await this.api.getLabels();
    const output = OutputFormatter.formatLabels(labels, options.colors !== false && options.colours !== false);
    console.log(output);
  }

  private async executeAdd(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      console.error(chalk.red('❌ Label name cannot be empty'));
      return;
    }

    try {
      const label = await this.api.createLabel(name.trim());
      console.log(chalk.green('✅ Label created successfully'));
      console.log(chalk.gray(`   Name: ${label.name}`));
      console.log(chalk.gray(`   ID: ${label.id}`));
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.error(chalk.red('❌ Invalid label name or label already exists'));
      } else {
        throw error;
      }
    }
  }

  private async executeDelete(identifier: string, options: { yes?: boolean }): Promise<void> {
    const labels = await this.api.getLabels();

    // Find label by name or ID
    const label = labels.find(l =>
      l.name.toLowerCase() === identifier.toLowerCase() ||
      l.id === identifier ||
      l.id.startsWith(identifier)
    );

    if (!label) {
      console.error(chalk.red(`❌ Label not found: ${identifier}`));
      return;
    }

    // Show what will be deleted
    console.log(chalk.yellow(`⚠️  About to delete label:`));
    console.log(chalk.gray(`   Name: ${label.name}`));
    console.log(chalk.gray(`   ID: ${label.id}`));

    // Confirm deletion unless --yes flag is used
    if (!options.yes) {
      const { default: inquirer } = await import('inquirer');
      const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this label? (It will be removed from all tasks)',
        default: false,
      }]);

      if (!answer.confirm) {
        console.log(chalk.gray('Deletion cancelled'));
        return;
      }
    }

    try {
      await this.api.deleteLabel(label.id);
      console.log(chalk.green(`✅ Label "${label.name}" deleted successfully`));
      console.log(chalk.gray('   It has been removed from all tasks'));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.error(chalk.red('❌ Label not found (may have been already deleted)'));
      } else {
        throw error;
      }
    }
  }
}
