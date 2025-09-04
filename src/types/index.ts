export interface TodoistTask {
  id: string;
  content: string;
  description?: string;
  project_id: string;
  section_id?: string;
  parent_id?: string;
  order: number;
  labels: string[];
  priority: number;
  due?: {
    date: string;
    datetime?: string;
    string: string;
    timezone?: string;
  };
  url: string;
  comment_count: number;
  created_at: string;
  creator_id: string;
  is_completed: boolean;
}

export interface TodoistProject {
  id: string;
  name: string;
  comment_count: number;
  order: number;
  color: string;
  is_shared: boolean;
  is_favorite: boolean;
  is_inbox_project: boolean;
  is_team_inbox: boolean;
  view_style: string;
  url: string;
  parent_id?: string;
}

export interface TodoistLabel {
  id: string;
  name: string;
  color: string;
  order: number;
  is_favorite: boolean;
}

export interface Config {
  token?: string;
  defaultProject?: string;
  showProjects?: string[]; // Projects to show in list by default
  outputFormat: "table" | "minimal" | "json";
  dateFormat: string;
  colors: boolean;
}

export interface TaskWithShortId {
  task: TodoistTask;
  shortId: string;
  project?: TodoistProject;
  offset?: number;
}

export interface OutputFormatOptions {
  colors: boolean;
  format: "table" | "minimal" | "json";
}

export interface FilterOptions {
  project?: string;
  label?: string;
  due?: string;
  priority?: number;
  completed?: boolean;
  sort?: "priority" | "due-date" | "created";
}

export interface CreateTaskOptions {
  content: string;
  project?: string;
  labels?: string[];
  priority?: number;
  due?: string;
  offset?: number;
}

export interface UpdateTaskOptions {
  content?: string;
  project?: string;
  labels?: string[];
  priority?: number;
  due?: string;
  offset?: number;
}
