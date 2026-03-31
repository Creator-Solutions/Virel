import { create } from 'zustand';
import type { Project, PaginatedResponse, ProjectDetail } from '@/domains/projects/projects.types';

interface ProjectsStore {
  projects: PaginatedResponse<Project>;
  isLoading: boolean;
  setProjects: (projects: PaginatedResponse<Project>) => void;
  setLoading: (loading: boolean) => void;
  addProject: (project: Project) => void;
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  addProject: (project) =>
    set((state) => ({
      projects: {
        ...state.projects,
        data: [project, ...state.projects.data],
        total: state.projects.total + 1,
      },
    })),
}));

interface ProjectDetailStore {
  project: ProjectDetail | null;
  isLoading: boolean;
  isDeploying: boolean;
  setProject: (project: ProjectDetail) => void;
  setLoading: (loading: boolean) => void;
  setDeploying: (deploying: boolean) => void;
}

export const useProjectDetailStore = create<ProjectDetailStore>((set) => ({
  project: null,
  isLoading: false,
  isDeploying: false,
  setProject: (project) => set({ project }),
  setLoading: (isLoading) => set({ isLoading }),
  setDeploying: (isDeploying) => set({ isDeploying }),
}));
