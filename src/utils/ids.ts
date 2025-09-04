import { TodoistTask, TaskWithShortId } from "../types/index.js";
import { ErrorHandler } from "./errors.js";

export class IDManager {
  private static idMap = new Map<string, string>();
  private static reverseMap = new Map<string, string>();
  private static taskMap = new Map<string, TodoistTask>();

  static generateShortIds(tasks: TodoistTask[]): TaskWithShortId[] {
    this.idMap.clear();
    this.reverseMap.clear();
    this.taskMap.clear();

    const tasksWithShortIds: TaskWithShortId[] = [];

    // Sort tasks consistently to ensure stable short IDs
    const sortedTasks = [...tasks].sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    );

    for (const task of sortedTasks) {
      const shortId = this.generateAlphanumericId(task.id);

      this.idMap.set(shortId, task.id);
      this.reverseMap.set(task.id, shortId);
      this.taskMap.set(task.id, task);

      tasksWithShortIds.push({
        task,
        shortId,
      });
    }

    return tasksWithShortIds;
  }

  private static generateAlphanumericId(fullId: string): string {
    // Create a consistent hash of the full ID
    const hash = this.simpleHash(fullId);
    let shortId = hash.toString(36);

    // Ensure minimum length of 2 characters
    if (shortId.length < 2) {
      shortId = shortId.padStart(2, "0");
    }

    // If collision, append counter in base36
    let counter = 0;
    let candidateId = shortId;

    while (this.idMap.has(candidateId)) {
      counter++;
      candidateId = shortId + counter.toString(36);
    }

    return candidateId.toLowerCase().substring(0, 4); // Keep max 4 chars for brevity
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) % 46656; // 36^3 to get good distribution
  }

  static resolveShortId(shortId: string): string {
    // Try exact match first
    if (this.idMap.has(shortId)) {
      return this.idMap.get(shortId)!;
    }

    // Try prefix matching
    const matches: Array<{ shortId: string; fullId: string; content: string }> =
      [];
    for (const [short, full] of this.idMap.entries()) {
      if (short.startsWith(shortId.toLowerCase())) {
        const task = this.taskMap.get(full);
        matches.push({
          shortId: short,
          fullId: full,
          content: task?.content || "Unknown task",
        });
      }
    }

    if (matches.length === 0) {
      ErrorHandler.taskNotFound(shortId);
    }

    if (matches.length > 1) {
      const matchInfo = matches.map((m) => ({
        id: m.shortId,
        content: m.content,
      }));
      ErrorHandler.ambiguousId(shortId, matchInfo);
    }

    return matches[0].fullId;
  }

  static getShortId(fullId: string): string | undefined {
    return this.reverseMap.get(fullId);
  }

  static hasShortId(shortId: string): boolean {
    return (
      this.idMap.has(shortId) ||
      Array.from(this.idMap.keys()).some((id) =>
        id.startsWith(shortId.toLowerCase())
      )
    );
  }
}
