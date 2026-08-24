export type ProjectTargetPage = "projectspage" | "project-docs" | "project-links" | "project-reports";
export type ProjectNavigationAction = "details" | "create-doc" | "view-docs" | "links" | "reports";

export interface PendingProjectNavigation {
  projectId: string;
  action: ProjectNavigationAction;
}

const PROJECT_ID_KEY = "pendingProjectId";
const PROJECT_ACTION_KEY = "pendingProjectAction";

export const navigateToProject = (
  page: ProjectTargetPage,
  projectId: number | string,
  action: ProjectNavigationAction
) => {
  sessionStorage.setItem(PROJECT_ID_KEY, String(projectId));
  sessionStorage.setItem(PROJECT_ACTION_KEY, action);
  window.dispatchEvent(new CustomEvent("app:navigate", { detail: { page } }));
};

export const consumePendingProjectNavigation = (): PendingProjectNavigation | null => {
  const projectId = sessionStorage.getItem(PROJECT_ID_KEY);
  const action = sessionStorage.getItem(PROJECT_ACTION_KEY) as ProjectNavigationAction | null;

  if (!projectId) return null;

  sessionStorage.removeItem(PROJECT_ID_KEY);
  sessionStorage.removeItem(PROJECT_ACTION_KEY);

  return {
    projectId,
    action: action ?? "details",
  };
};
