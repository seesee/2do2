import chalk from "chalk";

export class ColoredID {
  private static readonly VOWELS = new Set(["a", "e", "i", "o", "u"]);
  private static readonly NUMBERS = new Set([
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ]);

  /**
   * Color-code a short ID for better readability
   * - Numbers: Cyan
   * - Consonants: Magenta
   * - Vowels: Yellow
   */
  static colorize(id: string, useColors: boolean = true): string {
    if (!useColors) {
      return id;
    }

    return id
      .split("")
      .map((char) => {
        const lowerChar = char.toLowerCase();

        if (this.NUMBERS.has(char)) {
          return chalk.cyan(char);
        } else if (this.VOWELS.has(lowerChar)) {
          return chalk.yellow(char);
        } else {
          // Consonants
          return chalk.magenta(char);
        }
      })
      .join("");
  }

  /**
   * Get color legend for help display
   */
  static getLegend(): string {
    return `ID Color Legend:
  ${chalk.cyan("Numbers (0-9)")} - Cyan
  ${chalk.magenta("Consonants (b,c,d,f...)")} - Magenta
  ${chalk.yellow("Vowels (a,e,i,o,u)")} - Yellow

Examples: ${this.colorize("2a5x")} ${this.colorize("9z1k")} ${this.colorize(
      "4e8m"
    )}`;
  }

  /**
   * Colorize multiple IDs in a string (for batch operations display)
   */
  static colorizeMultiple(text: string, useColors: boolean = true): string {
    if (!useColors) {
      return text;
    }

    // Match alphanumeric sequences that look like IDs (2-4 chars)
    return text.replace(/\b[a-z0-9]{2,4}\b/g, (match) => {
      return this.colorize(match, useColors);
    });
  }
}
