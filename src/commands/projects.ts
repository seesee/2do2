import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { OutputFormatter } from '../utils/formatters.js';
import chalk from 'chalk';

export class ProjectsCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('projects')
      .description('Manage projects')
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
      .description('List all projects')
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
      .description('Create a new project')
      .argument('<name>', 'project name')
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
      .description('Delete a project')
      .argument('<name>', 'project name or ID')
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
    const projects = await this.api.getProjects();
    const output = OutputFormatter.formatProjects(projects, options.colors !== false);
    console.log(output);
  }

  private async executeAdd(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      console.error(chalk.red('❌ Project name cannot be empty'));
      return;
    }

    try {
      const project = await this.api.createProject(name.trim());
      console.log(chalk.green('✅ Project created successfully'));
      console.log(chalk.gray(`   Name: ${project.name}`));
      console.log(chalk.gray(`   ID: ${project.id}`));
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.error(chalk.red('❌ Invalid project name or project already exists'));
      } else {
        throw error;
      }
    }
  }

  private async executeDelete(identifier: string, options: { yes?: boolean }): Promise<void> {
    const projects = await this.api.getProjects();

    // Find project by name or ID
    const project = projects.find(p =>
      p.name.toLowerCase() === identifier.toLowerCase() ||
      p.id === identifier ||
      p.id.startsWith(identifier)
    );

    if (!project) {
      console.error(chalk.red(`❌ Project not found: ${identifier}`));
      return;
    }

    if (project.is_inbox_project) {
      console.error(chalk.red('❌ Cannot delete the Inbox project'));
      return;
    }

    // Show what will be deleted
    console.log(chalk.yellow(`⚠️  About to delete project:`));
    console.log(chalk.gray(`   Name: ${project.name}`));
    console.log(chalk.gray(`   ID: ${project.id}`));

    // Confirm deletion unless --yes flag is used
    if (!options.yes) {
      const { default: inquirer } = await import('inquirer');
      const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this project? (All tasks will be moved to Inbox)',
        default: false,
      }]);

      if (!answer.confirm) {
        console.log(chalk.gray('Deletion cancelled'));
        return;
      }
    }

    try {
      await this.api.deleteProject(project.id);
      console.log(chalk.green(`✅ Project "${project.name}" deleted successfully`));
      console.log(chalk.gray('   All tasks have been moved to Inbox'));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.error(chalk.red('❌ Project not found (may have been already deleted)'));
      } else {
        throw error;
      }
    }
  }
}
