'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Project } from '@/lib/api';
import { cls } from '@/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProject(id)
      .then(setProject)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={cls('space-y-6')}>
        <p className={cls('text-solid-matte-gray')}>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={cls('space-y-6')}>
        <p className={cls('text-red-600')}>{error ?? 'Project not found'}</p>
        <Link
          href="/dashboard/projects"
          className={cls('text-alexandra hover:underline')}
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const projectWithContributors = project as Project & { creator?: { full_name?: string }; contributors?: Array<{ user?: { full_name?: string }; role?: string }> };

  return (
    <div className={cls('space-y-6')}>
      <Link
        href="/dashboard/projects"
        className={cls('text-sm text-alexandra hover:underline')}
      >
        ← Back to projects
      </Link>
      <section
        className={cls(
          'rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-sm',
          'text-blackout'
        )}
      >
        <div className={cls('flex items-start justify-between gap-4 mb-4 flex-wrap')}>
          <h1 className={cls('text-2xl md:text-3xl font-medium text-blackout')}>
            {project.title}
          </h1>
          <div className={cls('flex items-center gap-2 shrink-0')}>
            {project.project_type && (
              <span
                className={cls(
                  'text-xs px-2 py-1 rounded-sm uppercase',
                  project.project_type === 'community' && 'bg-[#34A853]/20 text-[#34A853]',
                  project.project_type === 'personal' && 'bg-[#4285F4]/20 text-[#4285F4]'
                )}
              >
                {project.project_type}
              </span>
            )}
            <span
              className={cls(
                'text-xs px-2 py-1 rounded-sm uppercase',
                project.status === 'ongoing'
                  ? 'bg-alexandra/20 text-alexandra'
                  : 'bg-[#DADCE0] text-solid-matte-gray'
              )}
            >
              {project.status}
            </span>
          </div>
        </div>
        {projectWithContributors.creator && (
          <p className={cls('text-sm text-solid-matte-gray mb-4')}>
            By {(projectWithContributors.creator as { full_name?: string }).full_name ?? 'Unknown'}
          </p>
        )}
        <p className={cls('text-solid-matte-gray whitespace-pre-wrap mb-6')}>
          {project.description}
        </p>
        <div className={cls('flex flex-wrap gap-4 text-sm')}>
          {project.duration && (
            <span className={cls('text-blackout')}>
              <span className={cls('font-medium')}>Duration:</span> {project.duration}
            </span>
          )}
          {project.start_date && (
            <span className={cls('text-blackout')}>
              <span className={cls('font-medium')}>Start:</span> {project.start_date}
            </span>
          )}
          {project.end_date && (
            <span className={cls('text-blackout')}>
              <span className={cls('font-medium')}>End:</span> {project.end_date}
            </span>
          )}
        </div>
        {project.github_repo && (
          <a
            href={project.github_repo}
            target="_blank"
            rel="noopener noreferrer"
            className={cls(
              'inline-block mt-4 text-alexandra hover:underline font-medium'
            )}
          >
            View on GitHub →
          </a>
        )}
        {project.demo_video_url && (
          <a
            href={project.demo_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cls(
              'inline-block mt-2 text-alexandra hover:underline font-medium'
            )}
          >
            Watch demo →
          </a>
        )}
        {projectWithContributors.contributors &&
          projectWithContributors.contributors.length > 0 && (
            <div className={cls('mt-6 pt-6 border-t border-[#DADCE0]')}>
              <h2 className={cls('font-semibold text-blackout mb-2')}>Contributors</h2>
              <ul className={cls('space-y-1')}>
                {projectWithContributors.contributors.map((c: { user?: { full_name?: string }; role?: string }, i: number) => (
                  <li key={i} className={cls('text-sm text-solid-matte-gray')}>
                    {(c.user as { full_name?: string })?.full_name ?? 'Unknown'} — {c.role ?? 'Contributor'}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </section>
    </div>
  );
}
