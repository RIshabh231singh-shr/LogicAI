/**
 * Projects API Service
 * Manages project workspaces, metadata, document associations, and analysis states
 */

const STORAGE_KEY = 'logicai_projects_v1';

const INITIAL_PROJECTS = [
  {
    id: 'proj_01',
    name: 'Enterprise Core Banking Platform',
    description: 'System architecture, API specifications, and cloud security review documents for next-gen core banking.',
    status: 'Ready',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    documentCount: 4,
    documents: [
      { id: 'doc_1', name: 'Core_Banking_Architecture.pdf', type: 'PDF', size: '2.4 MB', pages: 28, status: 'Indexed', uploadedAt: '2 hours ago' },
      { id: 'doc_2', name: 'API_Gateway_Specifications.pdf', type: 'PDF', size: '1.8 MB', pages: 16, status: 'Indexed', uploadedAt: '2 hours ago' },
      { id: 'doc_3', name: 'Security_RBAC_Matrix.xlsx', type: 'Spreadsheet', size: '420 KB', pages: 5, status: 'Indexed', uploadedAt: '1 hour ago' },
      { id: 'doc_4', name: 'Cloud_Infrastructure_Terraform.txt', type: 'Text', size: '85 KB', pages: 8, status: 'Indexed', uploadedAt: '30 mins ago' },
    ],
    findingsCount: 7,
    risksCount: 2,
    architectureSummary: 'Microservices architecture with Node.js API Gateway, event-driven Kafka message streaming, and PostgreSQL with pgvector for intelligence search.',
  },
  {
    id: 'proj_02',
    name: 'Payment Gateway Integration',
    description: 'PCI-DSS compliance, webhook resilience, retry policies, and fraud detection workflows.',
    status: 'Ready',
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    documentCount: 2,
    documents: [
      { id: 'doc_5', name: 'PCI_DSS_Compliance_Audit.pdf', type: 'PDF', size: '3.1 MB', pages: 34, status: 'Indexed', uploadedAt: '14 hours ago' },
      { id: 'doc_6', name: 'Webhook_Resilience_Spec.pdf', type: 'PDF', size: '950 KB', pages: 12, status: 'Indexed', uploadedAt: '12 hours ago' },
    ],
    findingsCount: 4,
    risksCount: 1,
    architectureSummary: 'Idempotent webhook ingestion with Redis semantic deduplication and exponential backoff retry queues.',
  },
  {
    id: 'proj_03',
    name: 'Customer Intelligence Engine',
    description: 'Machine learning feature store, real-time fraud scoring pipelines, and customer churn forecasting.',
    status: 'Processing',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    documentCount: 1,
    documents: [
      { id: 'doc_7', name: 'ML_Feature_Store_RFC.pdf', type: 'PDF', size: '1.2 MB', pages: 18, status: 'Processing', uploadedAt: '2 days ago' },
    ],
    findingsCount: 0,
    risksCount: 0,
    architectureSummary: 'Real-time feature calculation using Kafka Streams and Feast feature store.',
  }
];

export const projectsApi = {
  getProjects: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
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
