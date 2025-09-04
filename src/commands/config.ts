import { Command } from "commander";
import { BaseCommand } from "./base.js";
import { config } from "../utils/config.js";
import chalk from "chalk";

export class ConfigCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command("config")
      .description("Manage configuration")
      .action(() => {
        // Default action - show current config
        this.executeShow();
      });

    cmd.addCommand(this.createShowCommand());
    cmd.addCommand(this.createGetCommand());
    cmd.addCommand(this.createSetCommand());
    cmd.addCommand(this.createUnsetCommand());
    cmd.addCommand(this.createSetTokenCommand());

    return cmd;
  }

  private createShowCommand(): Command {
    return new Command("show")
      .description("Show current configuration")
      .action(() => {
        this.executeShow();
      });
  }

  private createGetCommand(): Command {
    return new Command("get")
      .description("Get a configuration value")
      .argument("<key>", "configuration key")
      .action((key: string) => {
        this.executeGet(key);
      });
  }

  private createSetCommand(): Command {
    return new Command("set")
      .description("Set a configuration value")
      .argument("<key>", "configuration key")
      .argument("<value>", "configuration value")
      .action((key: string, value: string) => {
        this.executeSet(key, value);
      });
  }

  private createUnsetCommand(): Command {
    return new Command("unset")
      .description("Remove a configuration value")
      .argument("<key>", "configuration key")
      .action((key: string) => {
        this.executeUnset(key);
      });
  }

  private createSetTokenCommand(): Command {
    return new Command("set-token")
      .description("Set Todoist API token")
      .argument("<token>", "Todoist API token")
      .action((token: string) => {
        this.executeSetToken(token);
      });
  }

  private executeShow(): void {
    const allConfig = config.getAll();

    console.log(chalk.bold("📋 Current Configuration:"));
    console.log("");

    // Show token status (masked for security)
    const token = allConfig.token;
    console.log(
      chalk.gray("API Token:"),
      token ? chalk.green("✅ Set") : chalk.red("❌ Not set")
    );

    // Show other config values
    console.log(
      chalk.gray("Default Project:"),
      allConfig.defaultProject || chalk.gray("Not set")
    );

    const showProjects = config.getShowProjects();
    console.log(
      chalk.gray("Show Projects:"),
      showProjects.length > 0
        ? showProjects.join(", ")
        : chalk.gray("All projects")
    );

    console.log(chalk.gray("Output Format:"), allConfig.outputFormat);
    console.log(chalk.gray("Date Format:"), allConfig.dateFormat);
    console.log(
      chalk.gray("Colours:"),
      allConfig.colors ? chalk.green("Enabled") : chalk.red("Disabled")
    );

    if (!token) {
      console.log("");
      console.log(
        chalk.blue(
          "💡 Set your API token with: 2do2 config set-token YOUR_TOKEN"
        )
      );
    }
  }

  private executeGet(key: string): void {
    const validKeys = [
      "token",
      "defaultProject",
      "showProjects",
      "outputFormat",
      "dateFormat",
      "colors",
      "colours",
    ];

    if (!validKeys.includes(key)) {
      console.error(chalk.red(`❌ Invalid configuration key: ${key}`));
      console.error(chalk.blue(`💡 Valid keys: ${validKeys.join(", ")}`));
      return;
    }

    const value = config.get(key as any);

    if (key === "token") {
      console.log(value ? "Set" : "Not set");
    } else {
      console.log(value?.toString() ?? "Not set");
    }
  }

  private executeSet(key: string, value: string): void {
    switch (key) {
      case "default-project":
      case "defaultProject":
        config.setDefaultProject(value);
        console.log(chalk.green(`✅ Default project set to: ${value}`));
        break;

      case "output-format":
      case "outputFormat":
        if (!["table", "minimal", "json"].includes(value)) {
          console.error(
            chalk.red("❌ Invalid output format. Use: table, minimal, or json")
          );
          return;
        }
        config.set("outputFormat", value as any);
        console.log(chalk.green(`✅ Output format set to: ${value}`));
        break;

      case "date-format":
      case "dateFormat":
        config.set("dateFormat", value);
        console.log(chalk.green(`✅ Date format set to: ${value}`));
        break;

      case "colors":
      case "colours":
        const boolValue = ["true", "1", "yes", "on"].includes(
          value.toLowerCase()
        );
        config.set("colors", boolValue);
        console.log(
          chalk.green(`✅ Colours ${boolValue ? "enabled" : "disabled"}`)
        );
        break;

      case "token":
        this.executeSetToken(value);
        break;

      default:
        console.error(chalk.red(`❌ Invalid configuration key: ${key}`));
        console.error(
          chalk.blue(
            "💡 Valid keys: default-project, output-format, date-format, colours/colors, token"
          )
        );
        break;
    }
  }

  private executeUnset(key: string): void {
    switch (key) {
      case "default-project":
      case "defaultProject":
        config.removeDefaultProject();
        console.log(
          chalk.green("✅ Default project removed (tasks will go to Inbox)")
        );
        break;

      case "token":
        config.delete("token");
        console.log(chalk.green("✅ API token removed"));
        break;

      case "output-format":
      case "outputFormat":
        config.delete("outputFormat");
        console.log(chalk.green("✅ Output format reset to default (table)"));
        break;

      case "date-format":
      case "dateFormat":
        config.delete("dateFormat");
        console.log(chalk.green("✅ Date format reset to default"));
        break;

      case "colors":
      case "colours":
        config.delete("colors");
        console.log(chalk.green("✅ Colours reset to default (enabled)"));
        break;

      default:
        console.error(chalk.red(`❌ Invalid configuration key: ${key}`));
        console.error(
          chalk.blue(
            "💡 Valid keys: default-project, output-format, date-format, colours/colors, token"
          )
        );
        break;
    }
  }

  private executeSetToken(token: string): void {
    if (!token || token.trim().length === 0) {
      console.error(chalk.red("❌ Token cannot be empty"));
      return;
    }

    config.setToken(token.trim());
    console.log(chalk.green("✅ API token set successfully"));
    console.log(chalk.blue("💡 You can now use 2do2 commands"));
  }
}
