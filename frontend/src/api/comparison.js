/**
 * Comparison API Service
 * Computes structured multi-category comparisons across projects and architecture documents
 */

export const comparisonApi = {
  compareProjects: async (projectA, projectB) => {
    return {
      timestamp: new Date().toISOString(),
      projectA: { id: projectA?.id, name: projectA?.name || 'Project A' },
      projectB: { id: projectB?.id, name: projectB?.name || 'Project B' },
      categories: [
        {
          category: 'Architecture & System Summary',
          projectAValue: projectA?.architectureSummary || 'No summary available.',
          projectBValue: projectB?.architectureSummary || 'No summary available.',
          assessment: projectA?.architectureSummary && projectB?.architectureSummary
            ? 'Dynamic comparison derived from analyzed project specifications.'
            : 'Upload documents to generate and compare architectural topology summaries.',
        },
        {
          category: 'Document Volume & Ingestion',
          projectAValue: `${projectA?.documentCount || 0} documents (${projectA?.documents?.length || 0} loaded)`,
          projectBValue: `${projectB?.documentCount || 0} documents (${projectB?.documents?.length || 0} loaded)`,
          assessment: 'Comparison of total indexed knowledge base volume.',
        },
        {
          category: 'Findings & Risk Density',
          projectAValue: `${projectA?.findingsCount || 0} grounded findings, ${projectA?.risksCount || 0} risk vectors`,
          projectBValue: `${projectB?.findingsCount || 0} grounded findings, ${projectB?.risksCount || 0} risk vectors`,
          assessment: 'Discovered architectural decisions and operational risk factors.',
        },
      ],
    };
  },
};
