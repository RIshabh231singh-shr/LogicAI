import React, { useState } from 'react';
import Dialog from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { projectsApi } from '../../api/projects';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../components/ui/Toast';

export default function CreateProjectDialog({ isOpen, onClose }) {
  const { refreshProjects, setSelectedProjectId, setCurrentRoute } = useWorkspace();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const created = await projectsApi.createProject({ name, description });
      addToast(`Project "${created.name}" created successfully.`);
      await refreshProjects();
      setSelectedProjectId(created.id);
      setName('');
      setDescription('');
      onClose();
      setCurrentRoute('projectDetails', { projectId: created.id });
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Create a workspace to group related architecture documents, RFCs, and specifications."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Identity & Access Service Migration"
          error={error}
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-workspace-secondary">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief scope, architecture goals, or document context..."
            className="block w-full rounded-lg border border-workspace-border hover:border-workspace-borderHover focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white px-3.5 py-2 text-sm text-workspace-text placeholder-workspace-muted focus:outline-none transition-colors"
          />
        </div>

        <div className="pt-3 border-t border-workspace-border flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
