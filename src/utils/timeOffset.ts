import { parseISO, addMinutes, format } from 'date-fns';

export class TimeOffsetHelper {
  // Pattern to match embedded real time: [realtime:2024-12-20T14:00:00]
  private static readonly REAL_TIME_PATTERN = /\[realtime:([^\]]+)\]/;

  /**
   * Apply offset to a due date string and embed the real time in task content
   */
  static applyOffset(dueString: string, offsetMinutes: number, taskContent: string): {
    adjustedDueString: string;
    updatedContent: string;
    realTime: string;
  } {
    // Parse the original due string to get a Date object
    let realDateTime: Date;
    let realTime: string;

    try {
      // Handle various due string formats that Todoist accepts
      if (dueString.toLowerCase() === 'today') {
        realDateTime = new Date();
        realDateTime.setHours(9, 0, 0, 0); // Default to 9 AM if no time specified
      } else if (dueString.toLowerCase() === 'tomorrow') {
        realDateTime = new Date();
        realDateTime.setDate(realDateTime.getDate() + 1);
        realDateTime.setHours(9, 0, 0, 0);
      } else if (dueString.includes('T') || dueString.match(/\d{4}-\d{2}-\d{2}/)) {
        // ISO format
        realDateTime = parseISO(dueString);
      } else {
        // For other formats, let Todoist parse it first, then we'll adjust
        // For now, create a reasonable default
        realDateTime = new Date();
        realDateTime.setHours(9, 0, 0, 0);
      }

      realTime = format(realDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss');
    } catch (error) {
      // If parsing fails, return original values
      return {
        adjustedDueString: dueString,
        updatedContent: taskContent,
        realTime: dueString
      };
    }

    // Calculate adjusted time by applying offset
    const adjustedDateTime = addMinutes(realDateTime, offsetMinutes);
    const adjustedDueString = format(adjustedDateTime, 'yyyy-MM-dd HH:mm');

    // Embed real time in task content
    const realTimeTag = `[realtime:${realTime}]`;
    const updatedContent = this.embedRealTime(taskContent, realTimeTag);

    return {
      adjustedDueString,
      updatedContent,
      realTime
    };
  }

  /**
   * Extract real time from task content
   */
  static extractRealTime(taskContent: string): string | null {
    const match = taskContent.match(this.REAL_TIME_PATTERN);
    return match ? match[1] : null;
  }

  /**
   * Remove real time tag from task content for display
   */
  static cleanContentForDisplay(taskContent: string): string {
    return taskContent.replace(this.REAL_TIME_PATTERN, '').trim();
  }

  /**
   * Check if task has embedded real time
   */
  static hasRealTime(taskContent: string): boolean {
    return this.REAL_TIME_PATTERN.test(taskContent);
  }

  /**
   * Update task content with new real time, removing old one if present
   */
  private static embedRealTime(taskContent: string, realTimeTag: string): string {
    // Remove existing real time tag if present
    const cleanContent = this.cleanContentForDisplay(taskContent);

    // Add new real time tag at the end
    return `${cleanContent} ${realTimeTag}`;
  }

  /**
   * Calculate what the display time should be based on real time and offset
   */
  static getDisplayTime(realTime: string, offsetMinutes: number): string {
    try {
      const realDateTime = parseISO(realTime);
      const displayDateTime = addMinutes(realDateTime, offsetMinutes);
      return format(displayDateTime, 'yyyy-MM-dd HH:mm');
    } catch {
      return realTime;
    }
  }

  /**
   * Format time for user-friendly display
   */
  static formatTimeForDisplay(dateTime: string): string {
    try {
      const date = parseISO(dateTime);
      const now = new Date();

      if (date.toDateString() === now.toDateString()) {
        return `Today ${format(date, 'HH:mm')}`;
      } else if (date.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
        return `Tomorrow ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'MMM dd HH:mm');
      }
    } catch {
      return dateTime;
    }
  }
}
