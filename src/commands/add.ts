import { Command } from 'commander';
import { BaseCommand } from './base.js';
import { CreateTaskOptions } from '../types/index.js';
import { ErrorHandler } from '../utils/errors.js';
import chalk from 'chalk';

export class AddCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command('add')
      .description('Add a new task')
      .argument('<content>', 'task content')
      .option('-p, --project <name>', 'project name')
      .option('-l, --labels <labels>', 'comma-separated labels')
      .option('-r, --priority <number>', 'priority (1-4)', parseInt)
      .option('-d, --due <when>', 'due date (today, tomorrow, 2pm, "Dec 25")')
      .option('-o, --offset <minutes>', 'alert offset in minutes (negative for before)', parseInt)
      .action(async (content: string, options) => {
        try {
          await this.execute(content, options);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(content: string, options: any): Promise<void> {
    if (!content || content.trim().length === 0) {
      ErrorHandler.missingRequired('content');
    }

    const createOptions: CreateTaskOptions = {
      content: content.trim(),
    };

    // Handle project
    if (options.project !== undefined) {
      if (options.project === '') {
        // Explicitly no project - will go to Inbox
        createOptions.project = undefined;
      } else {
        createOptions.project = options.project;
      }
    }
    // If no project option provided, API will handle default project logic

    // Handle labels
    if (options.labels) {
      createOptions.labels = this.parseLabels(options.labels);
    }

    // Handle priority
    if (options.priority) {
      createOptions.priority = this.validatePriority(options.priority);
    }

    // Handle due date
    if (options.due) {
      createOptions.due = options.due;
    }

    // Handle offset
    if (options.offset !== undefined) {
      createOptions.offset = options.offset;
    }

    try {
      const task = await this.api.createTask(createOptions);

      console.log(chalk.green('✅ Task created successfully'));
      console.log(chalk.gray(`   ID: ${task.id}`));
      console.log(chalk.gray(`   Content: ${task.content}`));

      if (createOptions.offset !== undefined) {
        const offsetText = createOptions.offset > 0 ?
          `${createOptions.offset} minutes after` :
          `${Math.abs(createOptions.offset)} minutes before`;
        console.log(chalk.gray(`   Alert: ${offsetText} due time`));
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data?.error || 'Invalid task data';
        console.error(chalk.red(`❌ ${message}`));

        // Provide helpful suggestions for common errors
        if (message.includes('due_string')) {
          ErrorHandler.invalidDate(options.due);
        }
      } else {
        throw error;
      }
    }
  }
}
