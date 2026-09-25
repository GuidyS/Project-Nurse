export type ProjectTargetPage = "projectspage" | "project-links" | "project-reports";
export type ProjectNavigationAction = "details" | "links" | "reports";
export type NavigationParamValue = string | number | boolean | null | undefined;

export interface PendingProjectNavigation {
  projectId: string;
  action: ProjectNavigationAction;
}

const PROJECT_ID_KEY = "pendingProjectId";
const PROJECT_ACTION_KEY = "pendingProjectAction";

export const getPageFromUrl = () => new URLSearchParams(window.location.search).get("page");

export const navigateToPage = (
  page: string,
  params: Record<string, NavigationParamValue> = {}
) => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page);

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    searchParams.set(key, String(value));
  });

  const nextUrl = `/?${searchParams.toString()}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (currentUrl !== nextUrl) {
    window.history.pushState({ page }, "", nextUrl);
  }

  window.dispatchEvent(new CustomEvent("app:navigate", { detail: { page } }));
};

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
