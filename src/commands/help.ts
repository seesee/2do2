import { Command } from "commander";
import chalk from "chalk";
import { DateHelper } from "../utils/dates.js";
import { ColoredID } from "../utils/colorId.js";

export class HelpCommand {
  createCommand(): Command {
    const cmd = new Command("help")
      .description("Show help information")
      .argument("[command]", "specific command to get help for")
      .action((command?: string) => {
        if (command) {
          this.showCommandHelp(command);
        } else {
          this.showGeneralHelp();
        }
      });

    cmd.addCommand(this.createFlagsCommand());
    cmd.addCommand(this.createShortcutsCommand());
    cmd.addCommand(this.createDatesCommand());
    cmd.addCommand(this.createIdsCommand());

    return cmd;
  }

  private createFlagsCommand(): Command {
    return new Command("flags")
      .description("Show all available flags and their shortcuts")
      .action(() => {
        this.showFlags();
      });
  }

  private createShortcutsCommand(): Command {
    return new Command("shortcuts")
      .description("Show keyboard shortcuts and tips")
      .action(() => {
        this.showShortcuts();
      });
  }

  private createDatesCommand(): Command {
    return new Command("dates")
      .description("Show available date aliases")
      .action(() => {
        this.showDateAliases();
      });
  }

  private createIdsCommand(): Command {
    return new Command("ids")
      .description("Show short ID color coding system")
      .action(() => {
        this.showIdColors();
      });
  }

  private showGeneralHelp(): void {
    console.log(chalk.bold("🚀 2do2 - Todoist CLI Tool"));
    console.log("");
    console.log(
      "A powerful command-line tool for managing your Todoist tasks."
    );
    console.log("");

    console.log(chalk.bold("📋 QUICK START:"));
    console.log(
      "  1. Set your API token:  ",
      chalk.cyan("2do2 config set-token YOUR_TOKEN")
    );
    console.log("  2. List your tasks:     ", chalk.cyan("2do2 list"));
    console.log(
      "  3. Add a new task:      ",
      chalk.cyan('2do2 add "Buy groceries"')
    );
    console.log("  4. Complete a task:     ", chalk.cyan("2do2 comp abc1"));
    console.log("");

    console.log(chalk.bold("📝 MAIN COMMANDS:"));
    console.log(
      chalk.cyan("  list, ls         "),
      "List tasks with filtering options"
    );
    console.log(chalk.cyan("  add              "), "Add a new task");
    console.log(chalk.cyan("  complete, comp   "), "Mark tasks as complete");
    console.log(chalk.cyan("  uncomplete, uncomp"), "Mark tasks as incomplete");
    console.log(chalk.cyan("  update           "), "Update task details");
    console.log(chalk.cyan("  delete, del      "), "Delete tasks");
    console.log("");

    console.log(chalk.bold("📁 ORGANIZATION:"));
    console.log(
      chalk.cyan("  projects         "),
      "Manage projects (list, add, delete)"
    );
    console.log(
      chalk.cyan("  labels           "),
      "Manage labels (list, add, delete)"
    );
    console.log(
      chalk.cyan("  show             "),
      "Set which projects to show by default"
    );
    console.log(chalk.cyan("  config           "), "Manage configuration");
    console.log(chalk.cyan("  sync             "), "Force sync with Todoist");
    console.log("");

    console.log(chalk.bold("🔍 FILTERING:"));
    console.log(
      "  Filter tasks by project:     ",
      chalk.cyan('2do2 list -p "Work"')
    );
    console.log(
      "  Filter by due date:          ",
      chalk.cyan("2do2 list -d today")
    );
    console.log(
      "  Filter by priority:          ",
      chalk.cyan("2do2 list -r 4")
    );
    console.log("  Show completed tasks:        ", chalk.cyan("2do2 list -c"));
    console.log("");

    console.log(chalk.bold("⏰ ALERTS & OFFSETS:"));
    console.log(
      "  Alert 10 minutes before:     ",
      chalk.cyan('2do2 add "Meeting" -d "2pm" -o -10')
    );
    console.log(
      "  Reminder 5 minutes after:    ",
      chalk.cyan('2do2 add "Follow up" -d "3pm" -o 5')
    );
    console.log("");

    console.log(chalk.bold("🎨 OUTPUT FORMATS:"));
    console.log(
      "  Table view (default):        ",
      chalk.cyan("2do2 list -f table")
    );
    console.log(
      "  Minimal view:                ",
      chalk.cyan("2do2 list -f minimal")
    );
    console.log(
      "  JSON output:                 ",
      chalk.cyan("2do2 list -f json")
    );
    console.log("");

    console.log(chalk.bold("💡 TIPS:"));
    console.log(
      "  • Use short alphanumeric IDs: ",
      chalk.cyan("2do2 comp 2a 5x 9z")
    );
    console.log(
      "  • Set projects to show by default: ",
      chalk.cyan('2do2 show add "Work"')
    );
    console.log(
      "  • Set a default project: ",
      chalk.cyan('2do2 config set default-project "Work"')
    );
    console.log(
      "  • Get help for any command: ",
      chalk.cyan("2do2 help <command>")
    );
    console.log(
      "  • Use flags shorthand: ",
      chalk.cyan('2do2 list -d today -p "Work" -r 4')
    );
    console.log("");

    console.log(
      chalk.gray("For detailed help on a specific command: "),
      chalk.cyan("2do2 help <command>")
    );
    console.log(
      chalk.gray("To see all flag shortcuts: "),
      chalk.cyan("2do2 help flags")
    );
  }

  private showCommandHelp(command: string): void {
    switch (command.toLowerCase()) {
      case "list":
      case "ls":
        this.showListHelp();
        break;
      case "add":
        this.showAddHelp();
        break;
      case "complete":
      case "comp":
        this.showCompleteHelp();
        break;
      case "update":
        this.showUpdateHelp();
        break;
      case "delete":
      case "del":
        this.showDeleteHelp();
        break;
      case "config":
        this.showConfigHelp();
        break;
      case "projects":
        this.showProjectsHelp();
        break;
      case "labels":
        this.showLabelsHelp();
        break;
      default:
        console.log(chalk.red(`❌ Unknown command: ${command}`));
        console.log(chalk.blue("💡 Run: 2do2 help for available commands"));
    }
  }

  private showListHelp(): void {
    console.log(chalk.bold("📋 LIST COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 list [options]"));
    console.log("Alias: ", chalk.cyan("2do2 ls [options]"));
    console.log("");
    console.log(chalk.bold("OPTIONS:"));
    console.log("  -p, --project <name>    Filter by project name");
    console.log("  -l, --label <name>      Filter by label");
    console.log("  -d, --due <when>        Filter by due date");
    console.log("  -r, --priority <1-4>    Filter by priority");
    console.log("  -c, --completed         Show completed tasks only");
    console.log(
      "  -s, --sort <field>      Sort by: priority, due-date, created"
    );
    console.log(
      "  -f, --format <type>     Output format: table, minimal, json"
    );
    console.log("  --no-colors            Disable colored output");
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log("  2do2 list                    # All active tasks");
    console.log('  2do2 ls -p "Work"           # Work project tasks');
    console.log(
      "  2do2 list -d today -r 4     # High priority tasks due today"
    );
    console.log(
      "  2do2 ls -c -f minimal       # Completed tasks, minimal view"
    );
  }

  private showAddHelp(): void {
    console.log(chalk.bold("➕ ADD COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 add <content> [options]"));
    console.log("");
    console.log(chalk.bold("OPTIONS:"));
    console.log("  -p, --project <name>     Project name (overrides default)");
    console.log("  -l, --labels <labels>    Comma-separated labels");
    console.log("  -r, --priority <1-4>     Priority level");
    console.log("  -d, --due <when>         Due date/time");
    console.log("  -o, --offset <minutes>   Alert offset (negative = before)");
    console.log("");
    console.log(chalk.bold("DUE DATE FORMATS:"));
    console.log(
      "  Aliases: today (t), tomorrow (tm), next week (nw), next month (nm)"
    );
    console.log('  Formats: "Dec 25", "2024-12-25 14:00"');
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log('  2do2 add "Buy groceries"');
    console.log('  2do2 add "Meeting" -p "Work" -d "tomorrow 2pm" -o -15');
    console.log('  2do2 add "Call dentist" -l "health,urgent" -r 3');
  }

  private showCompleteHelp(): void {
    console.log(chalk.bold("✅ COMPLETE COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 complete <id...>"));
    console.log("Alias: ", chalk.cyan("2do2 comp <id...>"));
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log("  2do2 comp abc1              # Complete one task");
    console.log("  2do2 complete abc1 def2     # Complete multiple tasks");
    console.log("  2do2 comp abc               # Use shortest unique ID");
  }

  private showUpdateHelp(): void {
    console.log(chalk.bold("✏️  UPDATE COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 update <id> [options]"));
    console.log("");
    console.log(chalk.bold("OPTIONS:"));
    console.log("  -t, --content <text>     Update task content");
    console.log('  -p, --project <name>     Update project (use "" to remove)');
    console.log("  -l, --labels <labels>    Update labels");
    console.log("  -r, --priority <1-4>     Update priority");
    console.log(
      '  -d, --due <when>         Update due date (use "" to remove)'
    );
    console.log("  -o, --offset <minutes>   Update alert offset");
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log('  2do2 update abc1 -t "New content"');
    console.log('  2do2 update abc1 -p "Personal" -d "next week"');
    console.log("  2do2 update abc1 -o -30     # Alert 30 minutes before");
  }

  private showDeleteHelp(): void {
    console.log(chalk.bold("🗑️  DELETE COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 delete <id...>"));
    console.log("Alias: ", chalk.cyan("2do2 del <id...>"));
    console.log("");
    console.log(chalk.bold("OPTIONS:"));
    console.log("  -y, --yes               Skip confirmation prompt");
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log("  2do2 del abc1           # Delete with confirmation");
    console.log("  2do2 delete abc1 def2   # Delete multiple tasks");
    console.log("  2do2 del abc1 -y        # Delete without confirmation");
  }

  private showConfigHelp(): void {
    console.log(chalk.bold("⚙️  CONFIG COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 config <subcommand>"));
    console.log("");
    console.log(chalk.bold("SUBCOMMANDS:"));
    console.log("  show                    Show all configuration");
    console.log("  get <key>              Get configuration value");
    console.log("  set <key> <value>      Set configuration value");
    console.log("  unset <key>            Remove configuration value");
    console.log("  set-token <token>      Set API token");
    console.log("");
    console.log(chalk.bold("CONFIGURATION KEYS:"));
    console.log("  token                  Todoist API token");
    console.log("  default-project        Default project for new tasks");
    console.log("  output-format          Default output format");
    console.log("  date-format           Date display format");
    console.log("  colors                 Enable/disable colors");
  }

  private showProjectsHelp(): void {
    console.log(chalk.bold("📁 PROJECTS COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 projects <subcommand>"));
    console.log("");
    console.log(chalk.bold("SUBCOMMANDS:"));
    console.log("  list, ls               List all projects");
    console.log("  add <name>             Create new project");
    console.log("  delete <name> [-y]     Delete project");
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log("  2do2 projects list");
    console.log('  2do2 projects add "New Project"');
    console.log('  2do2 projects delete "Old Project" -y');
  }

  private showLabelsHelp(): void {
    console.log(chalk.bold("🏷️  LABELS COMMAND HELP"));
    console.log("");
    console.log("Usage: ", chalk.cyan("2do2 labels <subcommand>"));
    console.log("");
    console.log(chalk.bold("SUBCOMMANDS:"));
    console.log("  list, ls               List all labels");
    console.log("  add <name>             Create new label");
    console.log("  delete <name> [-y]     Delete label");
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log("  2do2 labels list");
    console.log('  2do2 labels add "urgent"');
    console.log('  2do2 labels delete "old-label" -y');
  }

  private showFlags(): void {
    console.log(chalk.bold("🚩 FLAG REFERENCE"));
    console.log("");
    console.log(chalk.bold("GLOBAL FLAGS:"));
    console.log(
      "  -f, --format           Output format (table, minimal, json)"
    );
    console.log("  --no-colors           Disable colored output");
    console.log("  -h, --help            Show help");
    console.log("");
    console.log(chalk.bold("FILTERING FLAGS:"));
    console.log("  -p, --project         Filter by or set project");
    console.log("  -l, --label           Filter by or set labels");
    console.log("  -d, --due             Filter by or set due date");
    console.log(
      '  -r, --priority        Filter by or set priority (r = "rank")'
    );
    console.log("  -c, --completed       Show completed tasks");
    console.log("  -s, --sort            Sort results");
    console.log("");
    console.log(chalk.bold("TASK FLAGS:"));
    console.log("  -t, --content         Set task content/text");
    console.log("  -o, --offset          Set alert offset in minutes");
    console.log("");
    console.log(chalk.bold("OPERATION FLAGS:"));
    console.log("  -y, --yes             Skip confirmation prompts");
  }

  private showShortcuts(): void {
    console.log(chalk.bold("⚡ SHORTCUTS & TIPS"));
    console.log("");
    console.log(chalk.bold("COMMAND ALIASES:"));
    console.log("  list → ls             2do2 ls = 2do2 list");
    console.log("  complete → comp       2do2 comp = 2do2 complete");
    console.log("  uncomplete → uncomp   2do2 uncomp = 2do2 uncomplete");
    console.log("  delete → del          2do2 del = 2do2 delete");
    console.log("");
    console.log(chalk.bold("SHORT IDS:"));
    console.log("  Use shortest unique prefix: abc123 → abc1 → abc");
    console.log("  Batch operations: 2do2 comp abc1 def2 ghi3");
    console.log("");
    console.log(chalk.bold("COMMON WORKFLOWS:"));
    console.log("  Morning review:       2do2 ls -d today -s priority");
    console.log('  Quick add:           2do2 add "Task" -d 2pm -o -5');
    console.log("  Cleanup:             2do2 ls -d overdue");
    console.log("  Batch complete:      2do2 comp abc def ghi");
    console.log("");
    console.log(chalk.bold("CONFIGURATION SHORTCUTS:"));
    console.log(
      '  Set default project:  2do2 config set default-project "Work"'
    );
    console.log(
      "  Minimal output:       2do2 config set output-format minimal"
    );
    console.log("  Disable colors:       2do2 config set colors false");
  }

  private showDateAliases(): void {
    console.log(chalk.bold("📅 DATE ALIASES"));
    console.log("");
    console.log(DateHelper.getAliasHelp());
    console.log("");
    console.log(chalk.bold("EXAMPLES:"));
    console.log('  2do2 add "Meeting" -d t          # Today');
    console.log('  2do2 add "Deadline" -d tm        # Tomorrow');
    console.log('  2do2 add "Project" -d nw         # Next Monday');
    console.log("  2do2 list -d today               # Today's tasks");
    console.log("  2do2 list -d nm                  # Next month's tasks");
    console.log("");
    console.log(chalk.gray("All aliases work in both add and list commands"));
  }

  private showIdColors(): void {
    console.log(chalk.bold("🔤 SHORT ID COLOR CODING"));
    console.log("");
    console.log(ColoredID.getLegend());
    console.log("");
    console.log(chalk.bold("WHY COLOR CODING?"));
    console.log("• Helps distinguish similar characters (1, l, i)");
    console.log("• Makes IDs easier to read and remember");
    console.log("• Reduces typing errors when entering IDs");
    console.log("");
    console.log(
      chalk.gray("Colors only show when terminal colors are enabled")
    );
    console.log(chalk.gray("Use --no-colors flag to disable if needed"));
  }
}
