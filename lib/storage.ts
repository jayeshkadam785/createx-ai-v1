export interface Project {
  id: string;
  name: string;
  prompt: string;
  html?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "createx-ai-projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed) ? (parsed as Project[]) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;

  const projects = getProjects();
  const index = projects.findIndex((item) => item.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;

  const projects = getProjects().filter((project) => project.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
