import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { UpdateTaskOptions } from '../types/index.js';
import { IDManager } from '../utils/ids.js';
import chalk from 'chalk';

export class UpdateCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('update')
      .description('Update a task')
      .argument('<id>', 'task ID (short or full)')
      .option('-t, --content <text>', 'update task content')
      .option('-p, --project <name>', 'update project (use "" to remove)')
      .option('-l, --labels <labels>', 'update labels (comma-separated)')
      .option('-r, --priority <number>', 'update priority (1-4)', parseInt)
      .option('-d, --due <when>', 'update due date (use "" to remove)')
      .option('-o, --offset <minutes>', 'update alert offset (negative for before)', parseInt)
      .action(async (id: string, options) => {
        try {
          await this.execute(id, options);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(shortId: string, options: any): Promise<void> {
    // Get tasks to build ID mapping
    const tasks = await this.api.getTasks();
    const tasksWithIds = IDManager.generateShortIds(tasks);

    const fullId = IDManager.resolveShortId(shortId);
    const originalTask = tasks.find(t => t.id === fullId);

    if (!originalTask) {
      console.error(chalk.red(`❌ Task ${shortId} not found`));
      return;
    }

    const updateOptions: UpdateTaskOptions = {};
    let hasUpdates = false;

    // Update content
    if (options.content !== undefined) {
      updateOptions.content = options.content;
      hasUpdates = true;
    }

    // Update project
    if (options.project !== undefined) {
      updateOptions.project = options.project;
      hasUpdates = true;
    }

    // Update labels
    if (options.labels !== undefined) {
      updateOptions.labels = this.parseLabels(options.labels);
      hasUpdates = true;
    }

    // Update priority
    if (options.priority !== undefined) {
      updateOptions.priority = this.validatePriority(options.priority);
      hasUpdates = true;
    }

    // Update due date
    if (options.due !== undefined) {
      updateOptions.due = options.due;
      hasUpdates = true;
    }

    // Update offset
    if (options.offset !== undefined) {
      updateOptions.offset = options.offset;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      console.error(chalk.yellow('⚠️  No updates specified. Use --help to see available options.'));
      return;
    }

    try {
      const updatedTask = await this.api.updateTask(fullId, updateOptions);

      console.log(chalk.green('✅ Task updated successfully'));
      console.log(chalk.gray(`   ID: ${shortId}`));

      // Show what changed
      if (updateOptions.content) {
        console.log(chalk.gray(`   Content: ${originalTask.content} → ${updatedTask.content}`));
      }

      if (updateOptions.priority) {
        console.log(chalk.gray(`   Priority: ${originalTask.priority} → ${updatedTask.priority}`));
      }

      if (updateOptions.project !== undefined) {
        const projects = await this.api.getProjects();
        const oldProject = projects.find(p => p.id === originalTask.project_id)?.name || 'None';
        const newProject = projects.find(p => p.id === updatedTask.project_id)?.name || 'None';
        console.log(chalk.gray(`   Project: ${oldProject} → ${newProject}`));
      }

      if (updateOptions.labels) {
        const oldLabels = originalTask.labels.join(', ') || 'None';
        const newLabels = updatedTask.labels.join(', ') || 'None';
        console.log(chalk.gray(`   Labels: ${oldLabels} → ${newLabels}`));
      }

      if (updateOptions.due !== undefined) {
        const oldDue = originalTask.due?.string || 'None';
        const newDue = updatedTask.due?.string || 'None';
        console.log(chalk.gray(`   Due: ${oldDue} → ${newDue}`));
      }

      if (updateOptions.offset !== undefined) {
        const offsetText = updateOptions.offset > 0 ?
          `${updateOptions.offset} minutes after` :
          `${Math.abs(updateOptions.offset)} minutes before`;
        console.log(chalk.gray(`   Alert offset: ${offsetText} due time`));
      }

    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data?.error || 'Invalid update data';
        console.error(chalk.red(`❌ ${message}`));

        if (message.includes('due_string') && options.due) {
          console.error(chalk.blue('💡 Try formats like: today, tomorrow, 2pm, "Dec 25", "2024-12-25"'));
        }
      } else {
        throw error;
      }
    }
  }
}
