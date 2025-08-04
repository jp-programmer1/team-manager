export interface GitlabIteration {
  id: string;
  iid: number;
  title: string | null;
  description: string | null;
  start_date: string;
  due_date: string;
  state: number;
  web_url: string;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface GitlabIssues {
  weight: number;
  title: string;
  iid: number;
  web_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  project_id: number;
}

export interface Gitlab {
  iteration: GitlabIteration;
  issues: GitlabIssues[];
}