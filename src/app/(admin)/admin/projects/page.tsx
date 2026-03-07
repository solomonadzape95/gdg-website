'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';
import type { Project } from '@/lib/api';
import { cls } from '@/utils';

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getProjects({
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setProjects(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this project?')) return;
    setDeleteLoading(id);
    try {
      await api.deleteProject(id, token);
      loadProjects();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to delete');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : '—';

  const displayList = projects;

  return (
    <div className={cls('space-y-6')}>
      <div className={cls('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4')}>
        <h1 className={cls('text-2xl font-semibold text-blackout')}>Projects management</h1>
        <div className={cls('flex gap-2 flex-wrap')}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cls(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              statusFilter === 'all'
                ? 'bg-alexandra text-white'
                : 'border border-[#DADCE0] text-blackout hover:bg-tech-white'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ongoing')}
            className={cls(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              statusFilter === 'ongoing'
                ? 'bg-alexandra text-white'
                : 'border border-[#DADCE0] text-blackout hover:bg-tech-white'
            )}
          >
            Ongoing
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={cls(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              statusFilter === 'completed'
                ? 'bg-alexandra text-white'
                : 'border border-[#DADCE0] text-blackout hover:bg-tech-white'
            )}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={cls(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-alexandra text-white hover:bg-[#357AE8] transition-colors'
            )}
          >
            Create community project
          </button>
        </div>
      </div>

      {error && (
        <div className={cls('rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-red-700')}>
          {error}
        </div>
      )}

      <section
        className={cls(
          'rounded-xl border border-[#DADCE0] bg-white overflow-hidden',
          'text-blackout'
        )}
      >
        {loading ? (
          <div className={cls('p-8 text-center text-solid-matte-gray')}>Loading...</div>
        ) : displayList.length === 0 ? (
          <div className={cls('p-8 text-center text-solid-matte-gray')}>
            No projects found.
          </div>
        ) : (
          <div className={cls('overflow-x-auto')}>
            <table className={cls('w-full text-left')}>
              <thead>
                <tr className={cls('bg-tech-white border-b border-[#DADCE0]')}>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Title</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Type</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Status</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Created</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((p) => (
                  <tr key={p.id} className={cls('border-b border-[#DADCE0] hover:bg-tech-white/50')}>
                    <td className={cls('px-4 py-3')}>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className={cls('text-alexandra hover:underline font-medium')}
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className={cls('px-4 py-3 text-sm text-solid-matte-gray')}>
                      {p.project_type}
                    </td>
                    <td className={cls('px-4 py-3')}>
                      <span
                        className={cls(
                          'text-xs px-2 py-0.5 rounded-sm uppercase',
                          p.status === 'ongoing' && 'bg-alexandra/20 text-alexandra',
                          p.status === 'completed' && 'bg-green-100 text-green-800'
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className={cls('px-4 py-3 text-sm text-solid-matte-gray')}>
                      {formatDate(p.created_at)}
                    </td>
                    <td className={cls('px-4 py-3 flex gap-2')}>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className={cls('text-alexandra hover:underline text-sm font-medium')}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingProject(p)}
                        disabled={!!deleteLoading}
                        className={cls(
                          'text-alexandra hover:underline text-sm font-medium disabled:opacity-60'
                        )}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={!!deleteLoading}
                        className={cls(
                          'text-red-600 font-medium hover:underline disabled:opacity-60'
                        )}
                      >
                        {deleteLoading === p.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && token && (
        <CreateProjectModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadProjects();
          }}
          onError={(msg) => setError(msg)}
        />
      )}
      {editingProject && token && (
        <EditProjectModal
          project={editingProject}
          token={token}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null);
            loadProjects();
          }}
          onError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  token,
  onClose,
  onSuccess,
  onError,
}: {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    onError('');
    try {
      await api.createProject(
        {
          project_type: 'community',
          title: title.trim(),
          description: description.trim(),
          duration: duration.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          github_repo: githubRepo.trim() || null,
          demo_video_url: demoVideoUrl.trim() || null,
        },
        token
      );
      onSuccess();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cls(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 p-4'
      )}
      onClick={onClose}
    >
      <div
        className={cls(
          'bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto',
          'border border-[#DADCE0]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cls('text-xl font-semibold text-blackout mb-4')}>
          Create community project
        </h2>
        <form onSubmit={handleSubmit} className={cls('space-y-4')}>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 months"
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('grid grid-cols-2 gap-4')}>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              GitHub repo URL
            </label>
            <input
              type="url"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="https://github.com/..."
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              Demo video URL
            </label>
            <input
              type="url"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              placeholder="https://..."
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('flex gap-2 pt-2')}>
            <button
              type="submit"
              disabled={submitting}
              className={cls(
                'px-4 py-2 bg-alexandra text-white font-medium rounded-lg',
                'hover:bg-[#357AE8] disabled:opacity-60'
              )}
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cls(
                'px-4 py-2 border border-[#DADCE0] rounded-lg font-medium',
                'hover:bg-tech-white'
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProjectModal({
  project,
  token,
  onClose,
  onSuccess,
  onError,
}: {
  project: Project;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [duration, setDuration] = useState(project.duration ?? '');
  const [startDate, setStartDate] = useState(project.start_date ?? '');
  const [endDate, setEndDate] = useState(project.end_date ?? '');
  const [githubRepo, setGithubRepo] = useState(project.github_repo ?? '');
  const [demoVideoUrl, setDemoVideoUrl] = useState(project.demo_video_url ?? '');
  const [status, setStatus] = useState<'ongoing' | 'completed'>(project.status as 'ongoing' | 'completed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    onError('');
    try {
      await api.updateProject(
        project.id,
        {
          title: title.trim(),
          description: description.trim(),
          duration: duration.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          github_repo: githubRepo.trim() || null,
          demo_video_url: demoVideoUrl.trim() || null,
          status,
        },
        token
      );
      onSuccess();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cls(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 p-4'
      )}
      onClick={onClose}
    >
      <div
        className={cls(
          'bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto',
          'border border-[#DADCE0]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cls('text-xl font-semibold text-blackout mb-4')}>
          Edit project
        </h2>
        <form onSubmit={handleSubmit} className={cls('space-y-4')}>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed')}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 months"
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('grid grid-cols-2 gap-4')}>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              GitHub repo URL
            </label>
            <input
              type="url"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="https://github.com/..."
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>
              Demo video URL
            </label>
            <input
              type="url"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              placeholder="https://..."
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('flex gap-2 pt-2')}>
            <button
              type="submit"
              disabled={submitting}
              className={cls(
                'px-4 py-2 bg-alexandra text-white font-medium rounded-lg',
                'hover:bg-[#357AE8] disabled:opacity-60'
              )}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cls(
                'px-4 py-2 border border-[#DADCE0] rounded-lg font-medium',
                'hover:bg-tech-white'
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
