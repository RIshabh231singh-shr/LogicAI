const { query } = require('../config/db');

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  const b = parseInt(bytes, 10);
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Lists all projects belonging to the authenticated user.
 * Joins or aggregates documents count.
 */
async function getProjects(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch projects with document counts
    const projectsResult = await query(
      `SELECT p.id, p.name, p.description, p.status, p.architecture_summary, p.created_at, p.updated_at,
              COUNT(d.id)::int AS "documentCount"
       FROM projects p
       LEFT JOIN documents d ON d.project_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    // Fetch documents for each project
    const docsResult = await query(
      `SELECT id, project_id, filename, original_name, cloudinary_url, mime_type, size_bytes, uploaded_at
       FROM documents
       WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [userId]
    );

    const docsByProject = {};
    for (const doc of docsResult.rows) {
      if (doc.project_id) {
        if (!docsByProject[doc.project_id]) docsByProject[doc.project_id] = [];
        docsByProject[doc.project_id].push({
          id: doc.id,
          name: doc.original_name || doc.filename,
          filename: doc.filename,
          url: doc.cloudinary_url,
          size: formatBytes(doc.size_bytes),
          rawSize: doc.size_bytes,
          uploadedAt: doc.uploaded_at,
          mimeType: doc.mime_type,
          type: (doc.filename || '').split('.').pop().toUpperCase() || 'PDF',
          status: 'Indexed',
          pages: 1,
        });
      }
    }

    const projects = projectsResult.rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      architectureSummary: p.architecture_summary,
      documentCount: p.documentCount,
      documents: docsByProject[p.id] || [],
      findingsCount: 0,
      risksCount: 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('getProjects error:', error);
    next(error);
  }
}

/**
 * Gets details of a single project.
 */
async function getProjectById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const projectResult = await query(
      `SELECT id, name, description, status, architecture_summary, created_at, updated_at
       FROM projects
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const p = projectResult.rows[0];

    const docsResult = await query(
      `SELECT id, filename, original_name, cloudinary_url, mime_type, size_bytes, uploaded_at
       FROM documents
       WHERE project_id = $1 AND user_id = $2
       ORDER BY uploaded_at DESC`,
      [id, userId]
    );

    const documents = docsResult.rows.map((d) => ({
      id: d.id,
      name: d.original_name || d.filename,
      filename: d.filename,
      url: d.cloudinary_url,
      size: formatBytes(d.size_bytes),
      rawSize: d.size_bytes,
      uploadedAt: d.uploaded_at,
      mimeType: d.mime_type,
      type: (d.filename || '').split('.').pop().toUpperCase() || 'PDF',
      status: 'Indexed',
      pages: 1,
    }));

    return res.status(200).json({
      success: true,
      project: {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        architectureSummary: p.architecture_summary,
        documentCount: documents.length,
        documents,
        findingsCount: 0,
        risksCount: 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('getProjectById error:', error);
    next(error);
  }
}

/**
 * Creates a new project for the authenticated user.
 */
async function createProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const result = await query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, status, architecture_summary, created_at, updated_at`,
      [userId, name.trim(), description ? description.trim() : 'Project workspace created in LogicAI.']
    );

    const p = result.rows[0];

    return res.status(201).json({
      success: true,
      project: {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        architectureSummary: p.architecture_summary,
        documentCount: 0,
        documents: [],
        findingsCount: 0,
        risksCount: 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('createProject error:', error);
    next(error);
  }
}

/**
 * Deletes a project belonging to the authenticated user.
 */
async function deleteProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      id,
    });
  } catch (error) {
    console.error('deleteProject error:', error);
    next(error);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
};
