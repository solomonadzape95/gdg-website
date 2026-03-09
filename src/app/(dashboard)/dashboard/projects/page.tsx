'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Project } from '@/lib/api';
import { cls } from '@/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProjects({ limit: 50 })
      .then(setProjects)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={cls('space-y-6')}>
      <h1 className={cls('text-2xl md:text-3xl font-medium text-blackout')}>
        Projects
      </h1>
      <section
        className={cls(
          'rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-sm',
          'text-blackout'
        )}
      >
        {loading && (
          <p className={cls('text-solid-matte-gray')}>Loading projects...</p>
        )}
        {error && (
          <p className={cls('text-red-600')}>{error}</p>
        )}
        {!loading && !error && projects.length === 0 && (
          <p className={cls('text-solid-matte-gray')}>No projects yet.</p>
        )}
        {!loading && !error && projects.length > 0 && (
          <ul className={cls('space-y-4')}>
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className={cls(
                    'block rounded-lg border border-[#DADCE0] p-4',
                    'hover:border-alexandra/50 transition-colors'
                  )}
                >
                  <div className={cls('flex items-center justify-between mb-2')}>
                    <h2 className={cls('font-semibold text-blackout')}>{p.title}</h2>
                    <div className={cls('flex items-center gap-2')}>
                      <span
                        className={cls(
                          'text-xs px-2 py-0.5 rounded-sm uppercase',
                          p.project_type === 'community' && 'bg-[#34A853]/20 text-[#34A853]',
                          p.project_type === 'personal' && 'bg-[#4285F4]/20 text-[#4285F4]'
                        )}
                      >
                        {p.project_type}
                      </span>
                      <span
                      className={cls(
                        'text-xs px-2 py-0.5 rounded-sm uppercase',
                        p.status === 'ongoing'
                          ? 'bg-alexandra/20 text-alexandra'
                          : 'bg-[#DADCE0] text-solid-matte-gray'
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className={cls('text-sm text-solid-matte-gray line-clamp-2')}>
                    {p.description}
                  </p>
                  {p.github_repo && (
                    <a
                      href={p.github_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={cls(
                        'text-sm text-alexandra hover:underline mt-2 inline-block'
                      )}
                    >
                      View on GitHub →
                    </a>
                  )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
