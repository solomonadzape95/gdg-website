'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';
import type { Event } from '@/lib/api';
import { cls } from '@/utils';

export default function EventDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regChecking, setRegChecking] = useState(true);

  useEffect(() => {
    api
      .getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!token) {
      setRegChecking(false);
      return;
    }
    api
      .getRegistrationStatus(id, token)
      .then((res) => setRegistered(res.registered))
      .catch(() => {})
      .finally(() => setRegChecking(false));
  }, [id, token]);

  const handleRegister = async () => {
    if (!token) return;
    setRegLoading(true);
    try {
      if (registered) {
        await api.unregisterFromEvent(id, token);
        setRegistered(false);
      } else {
        await api.registerForEvent(id, token);
        setRegistered(true);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cls('space-y-6')}>
        <p className={cls('text-solid-matte-gray')}>Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={cls('space-y-6')}>
        <p className={cls('text-red-600')}>{error ?? 'Event not found'}</p>
        <Link
          href="/dashboard/events"
          className={cls('text-alexandra hover:underline')}
        >
          Back to events
        </Link>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (t: string) => {
    try {
      const [h, m] = t.split(':');
      const hour = parseInt(h ?? '0', 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m ?? '00'} ${ampm}`;
    } catch {
      return t;
    }
  };

  return (
    <div className={cls('space-y-6')}>
      <Link
        href="/dashboard/events"
        className={cls('text-sm text-alexandra hover:underline')}
      >
        &larr; Back to events
      </Link>
      <section
        className={cls(
          'rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-sm',
          'text-blackout'
        )}
      >
        <div className={cls('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4')}>
          <h1 className={cls('text-2xl md:text-3xl font-medium text-blackout')}>
            {event.title}
          </h1>
          {token && !regChecking && (
            <button
              type="button"
              onClick={handleRegister}
              disabled={regLoading}
              className={cls(
                'px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shrink-0 disabled:opacity-60',
                registered
                  ? 'border border-red-300 text-red-600 hover:bg-red-50'
                  : 'bg-alexandra text-white hover:bg-[#357AE8]'
              )}
            >
              {regLoading
                ? '...'
                : registered
                  ? 'Unregister'
                  : 'Register for this event'}
            </button>
          )}
        </div>
        <div className={cls('space-y-2 text-solid-matte-gray mb-4')}>
          <p>
            <span className={cls('font-medium text-blackout')}>Date:</span>{' '}
            {formatDate(event.date)}
          </p>
          <p>
            <span className={cls('font-medium text-blackout')}>Time:</span>{' '}
            {formatTime(event.start_time)} &ndash; {formatTime(event.end_time)}
          </p>
          {event.location && (
            <p>
              <span className={cls('font-medium text-blackout')}>Location:</span>{' '}
              {event.location}
            </p>
          )}
          {event.attendees != null && (
            <p>
              <span className={cls('font-medium text-blackout')}>Attendees:</span>{' '}
              {event.attendees}
            </p>
          )}
        </div>
        {event.description && (
          <div className={cls('prose prose-sm max-w-none text-blackout')}>
            <p className={cls('whitespace-pre-wrap')}>{event.description}</p>
          </div>
        )}
        {event.speakers && event.speakers.length > 0 && (
          <div className={cls('mt-6 pt-6 border-t border-[#DADCE0]')}>
            <h2 className={cls('font-semibold text-blackout mb-3')}>Speakers</h2>
            <ul className={cls('space-y-3')}>
              {event.speakers.map((s) => (
                <li key={s.id} className={cls('p-3 rounded-lg border border-[#DADCE0] bg-tech-white')}>
                  <p className={cls('font-medium text-blackout')}>{s.name}</p>
                  {s.topic && <p className={cls('text-sm text-solid-matte-gray')}>{s.topic}</p>}
                  <p className={cls('text-xs text-solid-matte-gray mt-1')}>{s.niche}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
