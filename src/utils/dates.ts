import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
} from "date-fns";

export class DateHelper {
  private static dateAliases: Record<string, () => Date> = {
    // Full aliases
    today: () => new Date(),
    tomorrow: () => addDays(new Date(), 1),
    "next week": () =>
      startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }), // Monday
    "next month": () => startOfMonth(addMonths(new Date(), 1)),

    // Short aliases
    t: () => new Date(),
    tm: () => addDays(new Date(), 1),
    nw: () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
    nm: () => startOfMonth(addMonths(new Date(), 1)),

    // Additional common aliases
    tod: () => new Date(),
    tom: () => addDays(new Date(), 1),
    week: () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
    month: () => startOfMonth(addMonths(new Date(), 1)),
  };

  static expandDateAlias(input: string): string {
    const lowerInput = input.toLowerCase().trim();

    if (this.dateAliases[lowerInput]) {
      const date = this.dateAliases[lowerInput]();
      return format(date, "yyyy-MM-dd");
    }

    return input;
  }

  static isDateAlias(input: string): boolean {
    return this.dateAliases.hasOwnProperty(input.toLowerCase().trim());
  }

  static getAllAliases(): string[] {
    return Object.keys(this.dateAliases);
  }

  static getAliasHelp(): string {
    return `Available date aliases:
  Full forms:    today, tomorrow, next week, next month
  Short forms:   t, tm, nw, nm
  Alt forms:     tod, tom, week, month

Examples:
  2do2 add "Task" -d today     # Today
  2do2 add "Task" -d t         # Today (short)
  2do2 add "Task" -d tm        # Tomorrow (short)
  2do2 add "Task" -d nw        # Next Monday
  2do2 list -d tomorrow        # Tomorrow's tasks
  2do2 list -d nm              # Next month's tasks`;
  }

  static formatDateForDisplay(
    date: Date | string,
    formatStr: string = "yyyy-MM-dd"
  ): string {
    let dateObj: Date;

    if (typeof date === "string") {
      try {
        dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return date; // Return original string if invalid
        }
      } catch {
        return date; // Return original string if parsing fails
      }
    } else {
      dateObj = date;
    }

    return format(dateObj, formatStr);
  }
}
