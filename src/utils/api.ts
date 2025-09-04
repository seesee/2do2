import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  TodoistTask,
  TodoistProject,
  TodoistLabel,
  CreateTaskOptions,
  UpdateTaskOptions,
} from "../types/index.js";
import { config } from "./config.js";
import { ErrorHandler } from "./errors.js";
import { DateHelper } from "./dates.js";
import { TimeOffsetHelper } from "./timeOffset.js";

export class TodoistAPI {
  private client: AxiosInstance;
  private baseURL = "https://api.todoist.com/rest/v2";

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        ErrorHandler.handleAPIError(error);
        throw error;
      }
    );
  }

  private getToken(): string | undefined {
    return config.getToken();
  }

  private ensureToken(): void {
    if (!this.getToken()) {
      ErrorHandler.noToken();
    }
  }

  async getTasks(projectId?: string): Promise<TodoistTask[]> {
    this.ensureToken();
    const params: any = {};
    if (projectId) {
      params.project_id = projectId;
    }

    const response: AxiosResponse<TodoistTask[]> = await this.client.get(
      "/tasks",
      { params }
    );
    return response.data;
  }

  async getProjects(): Promise<TodoistProject[]> {
    this.ensureToken();
    const response: AxiosResponse<TodoistProject[]> = await this.client.get(
      "/projects"
    );
    return response.data;
  }

  async getLabels(): Promise<TodoistLabel[]> {
    this.ensureToken();
    const response: AxiosResponse<TodoistLabel[]> = await this.client.get(
      "/labels"
    );
    return response.data;
  }

  async createTask(options: CreateTaskOptions): Promise<TodoistTask> {
    this.ensureToken();

    let taskContent = options.content;
    let dueString = options.due;

    // Handle offset if provided
    if (options.offset && options.due) {
      const expandedDue = DateHelper.expandDateAlias(options.due);
      const offsetResult = TimeOffsetHelper.applyOffset(
        expandedDue,
        options.offset,
        options.content
      );
      taskContent = offsetResult.updatedContent;
      dueString = offsetResult.adjustedDueString;
    }

    const payload: any = {
      content: taskContent,
    };

    if (options.project) {
      const projects = await this.getProjects();
      const project = projects.find((p) => p.name === options.project);
      if (project) {
        payload.project_id = project.id;
      } else {
        ErrorHandler.projectNotFound(options.project);
      }
    } else {
      const defaultProject = config.getDefaultProject();
      if (defaultProject) {
        const projects = await this.getProjects();
        const project = projects.find((p) => p.name === defaultProject);
        if (project) {
          payload.project_id = project.id;
        } else {
          ErrorHandler.defaultProjectNotFound(defaultProject);
        }
      }
    }

    if (options.labels && options.labels.length > 0) {
      payload.labels = options.labels;
    }

    if (options.priority) {
      payload.priority = Math.max(1, Math.min(4, options.priority));
    }

    if (dueString) {
      payload.due_string = options.offset
        ? dueString
        : DateHelper.expandDateAlias(dueString);
    }

    const response: AxiosResponse<TodoistTask> = await this.client.post(
      "/tasks",
      payload
    );
    return response.data;
  }

  async updateTask(
    taskId: string,
    options: UpdateTaskOptions
  ): Promise<TodoistTask> {
    this.ensureToken();

    const payload: any = {};
    let finalContent = options.content;
    let finalDueString = options.due;

    // Handle offset adjustments
    if (options.offset !== undefined && options.due) {
      const expandedDue = DateHelper.expandDateAlias(options.due);
      const baseContent = options.content || "";
      const offsetResult = TimeOffsetHelper.applyOffset(
        expandedDue,
        options.offset,
        baseContent
      );
      finalContent = offsetResult.updatedContent;
      finalDueString = offsetResult.adjustedDueString;
    }

    if (finalContent) {
      payload.content = finalContent;
    }

    if (options.project !== undefined) {
      if (options.project === "") {
        // Remove project assignment
        const projects = await this.getProjects();
        const inbox = projects.find((p) => p.is_inbox_project);
        if (inbox) {
          payload.project_id = inbox.id;
        }
      } else {
        const projects = await this.getProjects();
        const project = projects.find((p) => p.name === options.project);
        if (project) {
          payload.project_id = project.id;
        } else {
          ErrorHandler.projectNotFound(options.project);
        }
      }
    }

    if (options.labels) {
      payload.labels = options.labels;
    }

    if (options.priority) {
      payload.priority = Math.max(1, Math.min(4, options.priority));
    }

    if (finalDueString !== undefined) {
      if (finalDueString === "") {
        payload.due_string = null;
      } else {
        payload.due_string =
          options.offset !== undefined
            ? finalDueString
            : DateHelper.expandDateAlias(finalDueString);
      }
    }

    const response: AxiosResponse<TodoistTask> = await this.client.post(
      `/tasks/${taskId}`,
      payload
    );
    return response.data;
  }

  async completeTask(taskId: string): Promise<void> {
    this.ensureToken();
    await this.client.post(`/tasks/${taskId}/close`);
  }

  async reopenTask(taskId: string): Promise<void> {
    this.ensureToken();
    await this.client.post(`/tasks/${taskId}/reopen`);
  }

  async deleteTask(taskId: string): Promise<void> {
    this.ensureToken();
    await this.client.delete(`/tasks/${taskId}`);
  }

  async createProject(name: string): Promise<TodoistProject> {
    this.ensureToken();
    const response: AxiosResponse<TodoistProject> = await this.client.post(
      "/projects",
      { name }
    );
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    this.ensureToken();
    await this.client.delete(`/projects/${projectId}`);
  }

  async createLabel(name: string): Promise<TodoistLabel> {
    this.ensureToken();
    const response: AxiosResponse<TodoistLabel> = await this.client.post(
      "/labels",
      { name }
    );
    return response.data;
  }

  async deleteLabel(labelId: string): Promise<void> {
    this.ensureToken();
    await this.client.delete(`/labels/${labelId}`);
  }

  async sync(): Promise<void> {
    this.ensureToken();
    // Force sync by getting all data
    await Promise.all([this.getTasks(), this.getProjects(), this.getLabels()]);
  }
}
