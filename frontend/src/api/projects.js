import { apiClient } from './client';

/**
 * Projects API Service
 * Backed by PostgreSQL via Node API Gateway with user-scoped isolation
 */
export const projectsApi = {
  getProjects: async () => {
    try {
      const res = await apiClient.get('/api/projects');
      return res.projects || [];
    } catch (err) {
      console.error('Failed to get projects from API:', err);
      return [];
    }
  },

  getProjectById: async (id) => {
    const res = await apiClient.get(`/api/projects/${id}`);
    if (!res.project) throw new Error(`Project with ID ${id} not found.`);
    return res.project;
  },

  createProject: async ({ name, description }) => {
    if (!name || !name.trim()) throw new Error('Project name is required.');
    const res = await apiClient.post('/api/projects', {
      name: name.trim(),
      description: description ? description.trim() : 'Project workspace created in LogicAI.',
    });
    return res.project;
  },

  deleteProject: async (id) => {
    const res = await apiClient.delete(`/api/projects/${id}`);
    return res;
  },

  addDocumentToProject: async (projectId, documentMeta) => {
    // Re-fetch project by ID to get the latest updated documents list
    return projectsApi.getProjectById(projectId);
  },
};
