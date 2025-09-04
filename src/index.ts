#!/usr/bin/env node

import { Command } from "commander";
import { ListCommand } from "./commands/list.js";
import { AddCommand } from "./commands/add.js";
import { CompleteCommand, UncompleteCommand } from "./commands/complete.js";
import { UpdateCommand } from "./commands/update.js";
import { DeleteCommand } from "./commands/delete.js";
import { ProjectsCommand } from "./commands/projects.js";
import { LabelsCommand } from "./commands/labels.js";
import { ConfigCommand } from "./commands/config.js";
import { SyncCommand } from "./commands/sync.js";
import { ShowCommand } from "./commands/show.js";
import { HelpCommand } from "./commands/help.js";
import { ErrorHandler } from "./utils/errors.js";
import chalk from "chalk";

const program = new Command();

program
  .name("2do2")
  .description("A powerful CLI tool for managing your Todoist items")
  .version("1.0.0")
  .configureHelp({
    sortSubcommands: true,
  });

// Add all commands
const listCommand = new ListCommand();
const addCommand = new AddCommand();
const completeCommand = new CompleteCommand();
const uncompleteCommand = new UncompleteCommand();
const updateCommand = new UpdateCommand();
const deleteCommand = new DeleteCommand();
const projectsCommand = new ProjectsCommand();
const labelsCommand = new LabelsCommand();
const configCommand = new ConfigCommand();
const syncCommand = new SyncCommand();
const showCommand = new ShowCommand();
const helpCommand = new HelpCommand();

program.addCommand(listCommand.createCommand());
program.addCommand(addCommand.createCommand());
program.addCommand(completeCommand.createCommand());
program.addCommand(uncompleteCommand.createCommand());
program.addCommand(updateCommand.createCommand());
program.addCommand(deleteCommand.createCommand());
program.addCommand(projectsCommand.createCommand());
program.addCommand(labelsCommand.createCommand());
program.addCommand(configCommand.createCommand());
program.addCommand(syncCommand.createCommand());
program.addCommand(showCommand.createCommand());
program.addCommand(helpCommand.createCommand());

// Handle unknown commands
program.on("command:*", function (operands) {
  const unknownCommand = operands[0];

  // Try to find similar commands
  const availableCommands = program.commands.map((cmd) => cmd.name());
  const suggestion = findSimilarCommand(unknownCommand, availableCommands);

  ErrorHandler.invalidCommand(unknownCommand, suggestion);
});

// Show help if no command provided
program.action(() => {
  console.log(chalk.bold("🚀 Welcome to 2do2!"));
  console.log("");
  console.log("Get started by setting your Todoist API token:");
  console.log(chalk.cyan("  2do2 config set-token YOUR_TOKEN"));
  console.log("");
  console.log("Then list your tasks:");
  console.log(chalk.cyan("  2do2 list"));
  console.log("");
  console.log("For full help:");
  console.log(chalk.cyan("  2do2 help"));
  console.log("");
});

// Function to find similar commands using simple string similarity
function findSimilarCommand(
  input: string,
  commands: string[]
): string | undefined {
  let bestMatch: string | undefined;
  let bestScore = 0;

  for (const command of commands) {
    const score = calculateSimilarity(
      input.toLowerCase(),
      command.toLowerCase()
    );
    if (score > bestScore && score > 0.4) {
      bestScore = score;
      bestMatch = command;
    }
  }

  return bestMatch;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.red("❌ Unhandled Rejection at:"), promise);
  console.error(chalk.red("Reason:"), reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error(chalk.red("❌ Uncaught Exception:"), error);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);
