export const PROJECT_STORAGE_KEY = "xquare-projects";

// 임시 저장
export function getStoredProjects(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];
    return Array.isArray(projects)
      ? projects.filter(
          (project): project is string => typeof project === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function addStoredProject(name: string) {
  const projects = getStoredProjects();
  if (projects.includes(name)) return;
  window.localStorage.setItem(
    PROJECT_STORAGE_KEY,
    JSON.stringify([...projects, name]),
  );
}
