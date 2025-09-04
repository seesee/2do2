import { Command } from "commander";
import { BaseCommand } from "./base.js";
import { IDManager } from "../utils/ids.js";
import { ColoredID } from "../utils/colorId.js";
import chalk from "chalk";

export class CompleteCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command("complete")
      .alias("comp")
      .description("Mark tasks as complete")
      .argument("<ids...>", "task IDs (short or full)")
      .action(async (ids: string[]) => {
        try {
          await this.execute(ids);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(shortIds: string[]): Promise<void> {
    // First, get all tasks to build the ID mapping
    const tasks = await this.api.getTasks();
    const tasksWithIds = IDManager.generateShortIds(
      tasks.filter((t) => !t.is_completed)
    );

    const completedTasks: string[] = [];
    const errors: string[] = [];

    for (const shortId of shortIds) {
      try {
        const fullId = IDManager.resolveShortId(shortId);
        await this.api.completeTask(fullId);

        const task = tasks.find((t) => t.id === fullId);
        const coloredId = ColoredID.colorize(shortId);
        completedTasks.push(`${coloredId}: ${task?.content || "Unknown task"}`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          errors.push(`Task ${shortId} not found`);
        } else {
          errors.push(`Failed to complete ${shortId}: ${error.message}`);
        }
      }
    }

    // Output results
    if (completedTasks.length > 0) {
      console.log(
        chalk.green(`✅ Completed ${completedTasks.length} task(s):`)
      );
      completedTasks.forEach((task) => {
        console.log(chalk.gray(`   • ${task}`));
      });
    }

    if (errors.length > 0) {
      console.log(chalk.red(`❌ Errors:`));
      errors.forEach((error) => {
        console.log(chalk.gray(`   • ${error}`));
      });
    }
  }
}

export class UncompleteCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command("uncomplete")
      .alias("uncomp")
      .description("Mark tasks as incomplete")
      .argument("<ids...>", "task IDs (short or full)")
      .action(async (ids: string[]) => {
        try {
          await this.execute(ids);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(shortIds: string[]): Promise<void> {
    // Get completed tasks for ID mapping
    const tasks = await this.api.getTasks();
    const completedTasks = tasks.filter((t) => t.is_completed);
    const tasksWithIds = IDManager.generateShortIds(completedTasks);

    const reopenedTasks: string[] = [];
    const errors: string[] = [];

    for (const shortId of shortIds) {
      try {
        const fullId = IDManager.resolveShortId(shortId);
        await this.api.reopenTask(fullId);

        const task = tasks.find((t) => t.id === fullId);
        reopenedTasks.push(task?.content || shortId);
      } catch (error: any) {
        if (error.response?.status === 404) {
          errors.push(`Task ${shortId} not found`);
        } else {
          errors.push(`Failed to reopen ${shortId}: ${error.message}`);
        }
      }
    }

    // Output results
    if (reopenedTasks.length > 0) {
      console.log(chalk.green(`🔄 Reopened ${reopenedTasks.length} task(s):`));
      reopenedTasks.forEach((task) => {
        console.log(chalk.gray(`   • ${task}`));
      });
    }

    if (errors.length > 0) {
      console.log(chalk.red(`❌ Errors:`));
      errors.forEach((error) => {
        console.log(chalk.gray(`   • ${error}`));
      });
    }
  }
}
