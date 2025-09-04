import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { config } from '../utils/config.js';
import chalk from 'chalk';

export class ShowCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('show')
      .description('Manage which projects to show by default')
      .action(() => {
        // Default action - show current show projects
        this.executeList();
      });

    cmd.addCommand(this.createListCommand());
    cmd.addCommand(this.createAddCommand());
    cmd.addCommand(this.createRemoveCommand());
    cmd.addCommand(this.createClearCommand());

    return cmd;
  }

  private createListCommand(): Command {
    return new Command('list')
      .alias('ls')
      .description('List current show projects')
      .action(() => {
        this.executeList();
      });
  }

  private createAddCommand(): Command {
    return new Command('add')
      .description('Add a project to show list')
      .argument('<project>', 'project name')
      .action(async (projectName: string) => {
        try {
          await this.executeAdd(projectName);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  private createRemoveCommand(): Command {
    return new Command('remove')
      .alias('rm')
      .description('Remove a project from show list')
      .argument('<project>', 'project name')
      .action((projectName: string) => {
        this.executeRemove(projectName);
      });
  }

  private createClearCommand(): Command {
    return new Command('clear')
      .description('Clear show projects (show all projects)')
      .action(() => {
        this.executeClear();
      });
  }

  private executeList(): void {
    const showProjects = config.getShowProjects();

    if (showProjects.length === 0) {
      console.log(chalk.gray('📋 Show Projects: All projects (no filter set)'));
    } else {
      console.log(chalk.bold('📋 Show Projects:'));
      showProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project}`);
      });
    }

    console.log('');
    console.log(chalk.gray('💡 When no project filter is specified, only tasks from these projects are shown'));
    console.log(chalk.gray('💡 Use -p flag in list command to override this filter'));
  }

  private async executeAdd(projectName: string): Promise<void> {
    // Verify project exists
    const projects = await this.api.getProjects();
    const matchingProject = projects.find(p =>
      p.name.toLowerCase().includes(projectName.toLowerCase())
    );

    if (!matchingProject) {
      console.error(chalk.red(`❌ Project not found: ${projectName}`));
      console.error(chalk.blue('💡 Available projects:'));
      projects.forEach(p => {
        console.error(chalk.gray(`   • ${p.name}`));
      });
      return;
    }

    config.addShowProject(matchingProject.name);
    console.log(chalk.green(`✅ Added "${matchingProject.name}" to show projects`));

    const current = config.getShowProjects();
    console.log(chalk.gray(`   Current show projects: ${current.join(', ')}`));
  }

  private executeRemove(projectName: string): void {
    const current = config.getShowProjects();
    const matchingProject = current.find(p =>
      p.toLowerCase().includes(projectName.toLowerCase())
    );

    if (!matchingProject) {
      console.error(chalk.red(`❌ Project "${projectName}" not in show list`));
      if (current.length > 0) {
        console.error(chalk.blue('💡 Current show projects:'));
        current.forEach(p => {
          console.error(chalk.gray(`   • ${p}`));
        });
      }
      return;
    }

    config.removeShowProject(matchingProject);
    console.log(chalk.green(`✅ Removed "${matchingProject}" from show projects`));

    const updated = config.getShowProjects();
    if (updated.length > 0) {
      console.log(chalk.gray(`   Remaining: ${updated.join(', ')}`));
    } else {
      console.log(chalk.gray('   Now showing all projects'));
    }
  }

  private executeClear(): void {
    const current = config.getShowProjects();

    if (current.length === 0) {
      console.log(chalk.gray('No show projects configured (already showing all)'));
      return;
    }

    config.clearShowProjects();
    console.log(chalk.green('✅ Cleared show projects filter'));
    console.log(chalk.gray('   Now showing tasks from all projects'));
  }
}
