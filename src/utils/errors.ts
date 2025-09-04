import chalk from 'chalk';

export class ErrorHandler {
  static handleAPIError(error: any): void {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;

      switch (status) {
        case 401:
          console.error(chalk.red('❌ Invalid API token'));
          console.error(chalk.blue('💡 Run: 2do2 config set-token YOUR_TOKEN'));
          break;
        case 403:
          console.error(chalk.red('❌ Access denied'));
          break;
        case 404:
          console.error(chalk.red('❌ Resource not found'));
          break;
        case 429:
          console.error(chalk.yellow('⚠️  Rate limit exceeded. Please try again later.'));
          break;
        default:
          console.error(chalk.red(`❌ API Error: ${message}`));
      }
    } else if (error.request) {
      console.error(chalk.red('❌ Network error. Please check your internet connection.'));
    } else {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  }

  static noToken(): never {
    console.error(chalk.red('❌ Todoist API token not configured'));
    console.error(chalk.blue('💡 Run: 2do2 config set-token YOUR_TOKEN'));
    process.exit(1);
  }

  static invalidDate(date: string): void {
    console.error(chalk.yellow(`⚠️  Invalid date format '${date}'. Try: today, tomorrow, 2pm, "Dec 25", "2024-12-25"`));
  }

  static ambiguousId(id: string, matches: Array<{id: string, content: string}>): never {
    console.error(chalk.yellow(`⚠️  Ambiguous ID '${id}' matches multiple tasks:`));
    matches.forEach(match => {
      console.error(`    ${match.id} - "${match.content}"`);
    });
    console.error(chalk.blue('💡 Use a longer prefix to disambiguate'));
    process.exit(1);
  }

  static taskNotFound(id: string): never {
    console.error(chalk.red(`❌ No task found matching '${id}'`));
    console.error(chalk.blue('💡 Try: 2do2 list to see all task IDs'));
    process.exit(1);
  }

  static projectNotFound(project: string): void {
    console.error(chalk.yellow(`⚠️  Project '${project}' not found. Using Inbox instead.`));
  }

  static defaultProjectNotFound(project: string): void {
    console.error(chalk.yellow(`⚠️  Default project '${project}' not found. Using Inbox instead.`));
    console.error(chalk.blue(`💡 Update with: 2do2 config set default-project "ValidProject"`));
  }

  static invalidPriority(priority: number): void {
    console.error(chalk.yellow(`⚠️  Priority must be 1-4. Using priority 4 instead.`));
  }

  static conflictingFlags(flag1: string, flag2: string, resolution: string): void {
    console.error(chalk.yellow(`⚠️  ${flag1} flag conflicts with ${flag2} filter. ${resolution}`));
  }

  static noDefaultProject(): void {
    console.error(chalk.blue('ℹ️  No default project configured. Task added to Inbox.'));
    console.error(chalk.blue('💡 Set default: 2do2 config set default-project "ProjectName"'));
  }

  static invalidCommand(command: string, suggestion?: string): never {
    console.error(chalk.red(`❌ Unknown command: ${command}`));
    if (suggestion) {
      console.error(chalk.blue(`💡 Did you mean: ${suggestion}?`));
    }
    console.error(chalk.blue('💡 Run: 2do2 help for available commands'));
    process.exit(1);
  }

  static missingRequired(field: string): never {
    console.error(chalk.red(`❌ Missing required field: ${field}`));
    process.exit(1);
  }
}
