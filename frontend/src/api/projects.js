/**
 * Projects API Service
 * Manages project workspaces, metadata, document associations, and analysis states
 */

const STORAGE_KEY = 'logicai_projects_v1';

const INITIAL_PROJECTS = [];

export const projectsApi = {
  getProjects: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clean out any legacy dummy projects
        const cleaned = parsed.filter(
          (p) => p.id !== 'proj_01' && p.id !== 'proj_02' && p.id !== 'proj_03'
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  },

  getProjectById: async (id) => {
    const projects = await projectsApi.getProjects();
    const found = projects.find((p) => p.id === id);
    if (!found) throw new Error(`Project with ID ${id} not found.`);
    return found;
  },

  createProject: async ({ name, description }) => {
    if (!name || !name.trim()) throw new Error('Project name is required.');
    const projects = await projectsApi.getProjects();
    const newProject = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      description: description ? description.trim() : 'Project workspace created in LogicAI.',
      status: 'Ready',
      updatedAt: new Date().toISOString(),
      documentCount: 0,
      documents: [],
      findingsCount: 0,
      risksCount: 0,
      architectureSummary: 'No documents analyzed yet. Upload documents to generate architecture summary.',
    };

    const updated = [newProject, ...projects];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProject;
  },

  deleteProject: async (id) => {
    const projects = await projectsApi.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true, id };
  },

  addDocumentToProject: async (projectId, documentMeta) => {
    const projects = await projectsApi.getProjects();
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const docs = [documentMeta, ...p.documents];
        return {
          ...p,
          documentCount: docs.length,
          documents: docs,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find((p) => p.id === projectId);
  },
};
