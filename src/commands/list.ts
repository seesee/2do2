import { Command } from "commander";
import { BaseCommand } from "./base.js";
import { FilterOptions } from "../types/index.js";
import { IDManager } from "../utils/ids.js";
import { OutputFormatter } from "../utils/formatters.js";
import { ErrorHandler } from "../utils/errors.js";
import {
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  startOfDay,
  endOfDay,
} from "date-fns";
import { DateHelper } from "../utils/dates.js";
import { config } from "../utils/config.js";

export class ListCommand extends BaseCommand {
  createCommand(): Command {
    const cmd = new Command("list")
      .alias("ls")
      .description("List tasks with filtering and sorting options")
      .option("-p, --project <name>", "filter by project name")
      .option("-l, --label <name>", "filter by label")
      .option(
        "-d, --due <when>",
        "filter by due date (today, tomorrow, overdue, YYYY-MM-DD)"
      )
      .option("-r, --priority <number>", "filter by priority (1-4)", parseInt)
      .option("-c, --completed", "show completed tasks")
      .option(
        "-s, --sort <field>",
        "sort by field (priority, due-date, created)"
      )
      .action(async (options) => {
        try {
          await this.execute(options);
        } catch (error) {
          this.handleError(error);
        }
      });

    return this.setupGlobalOptions(cmd);
  }

  private async execute(
    options: FilterOptions & { format?: string; colors?: boolean }
  ): Promise<void> {
    const tasks = await this.api.getTasks();
    const projects = await this.api.getProjects();

    // Filter tasks
    let filteredTasks = tasks;

    // Apply show projects filter if no explicit project filter is provided
    if (!options.project) {
      const showProjects = config.getShowProjects();
      if (showProjects.length > 0) {
        const showProjectIds = new Set(
          projects
            .filter((p) =>
              showProjects.some((sp) =>
                p.name.toLowerCase().includes(sp.toLowerCase())
              )
            )
            .map((p) => p.id)
        );

        if (showProjectIds.size > 0) {
          filteredTasks = filteredTasks.filter((task) =>
            showProjectIds.has(task.project_id)
          );
        }
      }
    }

    // Project filter
    if (options.project) {
      const project = projects.find((p) =>
        p.name.toLowerCase().includes(options.project!.toLowerCase())
      );
      if (project) {
        filteredTasks = filteredTasks.filter(
          (task) => task.project_id === project.id
        );
      } else {
        console.log(`No project found matching "${options.project}"`);
        return;
      }
    }

    // Label filter
    if (options.label) {
      filteredTasks = filteredTasks.filter((task) =>
        task.labels.some((label) =>
          label.toLowerCase().includes(options.label!.toLowerCase())
        )
      );
    }

    // Due date filter
    if (options.due) {
      filteredTasks = this.filterByDue(filteredTasks, options.due);
    }

    // Priority filter
    if (options.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === options.priority
      );
    }

    // Completed filter
    if (options.completed) {
      filteredTasks = filteredTasks.filter((task) => task.is_completed);
    } else {
      // By default, show only non-completed tasks
      filteredTasks = filteredTasks.filter((task) => !task.is_completed);
    }

    // Sort tasks
    if (options.sort) {
      filteredTasks = this.sortTasks(filteredTasks, options.sort);
    } else {
      // Default sort by priority desc, then due date asc
      filteredTasks.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        if (a.due && b.due) {
          return (
            parseISO(a.due.datetime || a.due.date).getTime() -
            parseISO(b.due.datetime || b.due.date).getTime()
          );
        }
        return a.due ? -1 : b.due ? 1 : 0;
      });
    }

    // Generate short IDs
    const tasksWithIds = IDManager.generateShortIds(filteredTasks);

    // Add project info
    tasksWithIds.forEach((taskWithId) => {
      taskWithId.project = projects.find(
        (p) => p.id === taskWithId.task.project_id
      );
    });

    // Format and output
    const output = OutputFormatter.formatTasks(tasksWithIds, projects, {
      format: (options.format as any) || "table",
      colors: options.colors !== false,
    });

    console.log(output);
  }

  private filterByDue(tasks: any[], dueFilter: string): any[] {
    // First check if it's a date alias
    const expandedDate = DateHelper.expandDateAlias(dueFilter);
    if (expandedDate !== dueFilter) {
      // It was an alias, use the expanded date as a specific date filter
      try {
        const targetDate = new Date(expandedDate);
        if (!isNaN(targetDate.getTime())) {
          return tasks.filter((task) => {
            if (!task.due) return false;
            const taskDate = parseISO(task.due.datetime || task.due.date);
            return (
              taskDate >= startOfDay(targetDate) &&
              taskDate <= endOfDay(targetDate)
            );
          });
        }
      } catch {
        // Fall through to original logic if expansion fails
      }
    }

    const now = new Date();

    switch (dueFilter.toLowerCase()) {
      case "today":
        return tasks.filter(
          (task) =>
            task.due && isToday(parseISO(task.due.datetime || task.due.date))
        );

      case "tomorrow":
        return tasks.filter(
          (task) =>
            task.due && isTomorrow(parseISO(task.due.datetime || task.due.date))
        );

      case "overdue":
        return tasks.filter(
          (task) =>
            task.due && isPast(parseISO(task.due.datetime || task.due.date))
        );

      default:
        // Try to parse as date
        try {
          const targetDate = new Date(dueFilter);
          if (isNaN(targetDate.getTime())) {
            ErrorHandler.invalidDate(dueFilter);
            return tasks;
          }

          return tasks.filter((task) => {
            if (!task.due) return false;
            const taskDate = parseISO(task.due.datetime || task.due.date);
            return (
              taskDate >= startOfDay(targetDate) &&
              taskDate <= endOfDay(targetDate)
            );
          });
        } catch {
          ErrorHandler.invalidDate(dueFilter);
          return tasks;
        }
    }
  }

  private sortTasks(tasks: any[], sortField: string): any[] {
    switch (sortField) {
      case "priority":
        return tasks.sort((a, b) => b.priority - a.priority);

      case "due-date":
        return tasks.sort((a, b) => {
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;

          return (
            parseISO(a.due.datetime || a.due.date).getTime() -
            parseISO(b.due.datetime || b.due.date).getTime()
          );
        });

      case "created":
        return tasks.sort(
          (a, b) =>
            parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
        );

      default:
        console.warn(`Unknown sort field: ${sortField}`);
        return tasks;
    }
  }
}
