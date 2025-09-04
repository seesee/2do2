import chalk from "chalk";
import Table from "cli-table3";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
} from "date-fns";
import {
  TaskWithShortId,
  TodoistProject,
  OutputFormatOptions,
} from "../types/index.js";
import { config } from "./config.js";
import { ColoredID } from "./colorId.js";
import { TimeOffsetHelper } from "./timeOffset.js";

export class OutputFormatter {
  static formatTasks(
    tasksWithIds: TaskWithShortId[],
    projects: TodoistProject[],
    options?: OutputFormatOptions
  ): string {
    const opts = {
      colors: options?.colors ?? config.get("colors"),
      format: options?.format ?? config.get("outputFormat"),
    };

    switch (opts.format) {
      case "json":
        return this.formatJSON(tasksWithIds);
      case "minimal":
        return this.formatMinimal(tasksWithIds, projects, opts.colors);
      case "table":
      default:
        return this.formatTable(tasksWithIds, projects, opts.colors);
    }
  }

  private static formatTable(
    tasksWithIds: TaskWithShortId[],
    projects: TodoistProject[],
    useColors: boolean
  ): string {
    if (tasksWithIds.length === 0) {
      return useColors ? chalk.gray("No tasks found") : "No tasks found";
    }

    // Get terminal width, defaulting to 80 if not available
    const terminalWidth = process.stdout.columns || 80;

    // Calculate optimal column widths
    const fixedWidth = 6 + 4 + 15 + 20; // ID + Pr. + Project + Due Date
    const availableForTask = terminalWidth - fixedWidth - 10; // Reserve for padding/borders
    const taskWidth = Math.max(25, Math.min(60, availableForTask)); // Min 25, max 60 chars

    const table = new Table({
      head: ["ID", "Pr.", "Task", "Project", "Due Date"].map((h) =>
        useColors ? chalk.bold(h) : h
      ),
      style: {
        head: [],
        border: useColors ? ["gray"] : [],
      },
      colWidths: [6, 4, taskWidth, 15, 20],
      wordWrap: true,
    });

    const header = useColors
      ? `📋 ${chalk.bold("Tasks")} ${chalk.gray(
          `(${tasksWithIds.length} items)`
        )}`
      : `Tasks (${tasksWithIds.length} items)`;

    console.log(header);

    tasksWithIds.forEach(({ task, shortId, project }) => {
      const projectInfo =
        project || projects.find((p) => p.id === task.project_id);
      const priorityIcon = this.getPriorityIcon(
        task.priority,
        task.due,
        useColors
      );
      const dueDateStr = this.formatDueDate(task.due, useColors);

      table.push([
        ColoredID.colorize(shortId, useColors),
        priorityIcon,
        task.content, // Don't truncate - let table handle wrapping
        this.truncate(projectInfo?.name || "", 13),
        dueDateStr,
      ]);
    });

    return table.toString();
  }

  private static formatMinimal(
    tasksWithIds: TaskWithShortId[],
    projects: TodoistProject[],
    useColors: boolean
  ): string {
    if (tasksWithIds.length === 0) {
      return useColors ? chalk.gray("No tasks found") : "No tasks found";
    }

    return tasksWithIds
      .map(({ task, shortId, project, offset }) => {
        const projectInfo =
          project || projects.find((p) => p.id === task.project_id);
        const priorityIcon = this.getPriorityIcon(
          task.priority,
          task.due,
          useColors
        );
        const dueDateStr = task.due
          ? this.formatDueDate(task.due, useColors)
          : "";
        const offsetStr = offset ? ` [${offset > 0 ? "+" : ""}${offset}m]` : "";
        const projectStr = projectInfo?.name ? ` (${projectInfo.name})` : "";

        return `${ColoredID.colorize(shortId, useColors)}  ${priorityIcon} ${
          task.content
        }${projectStr}${dueDateStr ? ` - ${dueDateStr}` : ""}${offsetStr}`;
      })
      .join("\n");
  }

  private static formatJSON(tasksWithIds: TaskWithShortId[]): string {
    const data = {
      tasks: tasksWithIds.map(({ task, shortId, offset }) => ({
        id: shortId,
        fullId: task.id,
        content: task.content,
        project_id: task.project_id,
        priority: task.priority,
        due: task.due,
        labels: task.labels,
        offset: offset,
        is_completed: task.is_completed,
        created_at: task.created_at,
      })),
    };
    return JSON.stringify(data, null, 2);
  }

  private static getPriorityIcon(
    priority: number,
    due: any,
    useColors: boolean
  ): string {
    if (!useColors) {
      return priority.toString();
    }

    const isOverdue = due && isPast(parseISO(due.datetime || due.date));
    const isDueToday = due && isToday(parseISO(due.datetime || due.date));

    if (isOverdue) {
      return "🔴";
    }

    if (isDueToday || priority === 4) {
      return "🔴";
    }

    if (priority === 3) {
      return "🟡";
    }

    if (priority === 2 || priority === 1) {
      return "🟢";
    }

    return "📝";
  }

  private static formatDueDate(due: any, useColors: boolean): string {
    if (!due) return "";

    const date = parseISO(due.datetime || due.date);
    const dateFormat = config.get("dateFormat");

    let formatted: string;
    if (isToday(date)) {
      formatted = due.datetime ? `Today ${format(date, "HH:mm")}` : "Today";
    } else if (isTomorrow(date)) {
      formatted = due.datetime
        ? `Tomorrow ${format(date, "HH:mm")}`
        : "Tomorrow";
    } else {
      formatted = format(date, dateFormat);
    }

    if (!useColors) return formatted;

    if (isPast(date)) {
      return chalk.red(formatted);
    } else if (isToday(date)) {
      return chalk.yellow(formatted);
    } else if (isFuture(date)) {
      return chalk.green(formatted);
    }

    return formatted;
  }

  private static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  static formatProjects(
    projects: TodoistProject[],
    useColors: boolean = true
  ): string {
    if (projects.length === 0) {
      return useColors ? chalk.gray("No projects found") : "No projects found";
    }

    const table = new Table({
      head: ["ID", "Name", "Color", "Tasks"].map((h) =>
        useColors ? chalk.bold(h) : h
      ),
      style: {
        head: [],
        border: useColors ? ["gray"] : [],
      },
    });

    const header = useColors
      ? `📁 ${chalk.bold("Projects")} ${chalk.gray(
          `(${projects.length} items)`
        )}`
      : `Projects (${projects.length} items)`;

    console.log(header);

    projects.forEach((project) => {
      table.push([
        project.id.substring(0, 8),
        project.name,
        project.color,
        project.comment_count.toString(),
      ]);
    });

    return table.toString();
  }

  static formatLabels(labels: any[], useColors: boolean = true): string {
    if (labels.length === 0) {
      return useColors ? chalk.gray("No labels found") : "No labels found";
    }

    const table = new Table({
      head: ["ID", "Name", "Color"].map((h) => (useColors ? chalk.bold(h) : h)),
      style: {
        head: [],
        border: useColors ? ["gray"] : [],
      },
    });

    const header = useColors
      ? `🏷️  ${chalk.bold("Labels")} ${chalk.gray(`(${labels.length} items)`)}`
      : `Labels (${labels.length} items)`;

    console.log(header);

    labels.forEach((label) => {
      table.push([label.id.substring(0, 8), label.name, label.color]);
    });

    return table.toString();
  }
}
