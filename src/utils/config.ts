import Conf from "conf";
import { Config } from "../types/index.js";

const defaultConfig: Config = {
  outputFormat: "table",
  dateFormat: "yyyy-MM-dd HH:mm",
  colors: true,
};

class ConfigManager {
  private config: Conf<Config>;

  constructor() {
    this.config = new Conf<Config>({
      projectName: "2do2",
      defaults: defaultConfig,
    });
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config.get(key);
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config.set(key, value);
  }

  has(key: keyof Config): boolean {
    return this.config.has(key);
  }

  delete(key: keyof Config): void {
    this.config.delete(key);
  }

  clear(): void {
    this.config.clear();
  }

  getAll(): Config {
    return this.config.store;
  }

  getToken(): string | undefined {
    return this.config.get("token");
  }

  setToken(token: string): void {
    this.config.set("token", token);
  }

  getDefaultProject(): string | undefined {
    return this.config.get("defaultProject");
  }

  setDefaultProject(project: string): void {
    this.config.set("defaultProject", project);
  }

  removeDefaultProject(): void {
    this.config.delete("defaultProject");
  }

  getShowProjects(): string[] {
    return this.config.get("showProjects") || [];
  }

  setShowProjects(projects: string[]): void {
    this.config.set("showProjects", projects);
  }

  addShowProject(project: string): void {
    const current = this.getShowProjects();
    if (!current.includes(project)) {
      this.setShowProjects([...current, project]);
    }
  }

  removeShowProject(project: string): void {
    const current = this.getShowProjects();
    this.setShowProjects(current.filter((p) => p !== project));
  }

  clearShowProjects(): void {
    this.config.delete("showProjects");
  }
}

export const config = new ConfigManager();
