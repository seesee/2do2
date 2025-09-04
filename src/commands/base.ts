import { Command } from 'commander';
import { TodoistAPI } from '../utils/api.js';
import { config } from '../utils/config.js';
import { ErrorHandler } from '../utils/errors.js';

export abstract class BaseCommand {
  protected api: TodoistAPI;

  constructor() {
    this.api = new TodoistAPI();
  }

  protected handleError(error: any): void {
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Network error. Please check your internet connection.');
    } else {
      ErrorHandler.handleAPIError(error);
    }
    process.exit(1);
  }

  protected validatePriority(priority: number): number {
    if (priority < 1 || priority > 4) {
      ErrorHandler.invalidPriority(priority);
      return 4;
    }
    return priority;
  }

  protected parseLabels(labelString?: string): string[] {
    if (!labelString) return [];
    return labelString.split(',').map(label => label.trim()).filter(Boolean);
  }

  protected setupGlobalOptions(command: Command): Command {
    return command
      .option('-f, --format <format>', 'output format (table, minimal, json)', 'table')
      .option('--no-colors', 'disable colored output');
  }
}
