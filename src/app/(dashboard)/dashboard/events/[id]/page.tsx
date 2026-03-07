'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Event } from '@/lib/api';
import { cls } from '@/utils';

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getEvent(id)
      .then(setEvent)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

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

  const eventWithSpeakers = event as Event & { speakers?: Array<{ name?: string; topic?: string }> };

  return (
    <div className={cls('space-y-6')}>
      <Link
        href="/dashboard/events"
        className={cls('text-sm text-alexandra hover:underline')}
      >
        ← Back to events
      </Link>
      <section
        className={cls(
          'rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-sm',
          'text-blackout'
        )}
      >
        <h1 className={cls('text-2xl md:text-3xl font-medium text-blackout mb-4')}>
          {event.title}
        </h1>
        <div className={cls('space-y-2 text-solid-matte-gray mb-4')}>
          <p>
            <span className={cls('font-medium text-blackout')}>Date:</span>{' '}
            {formatDate(event.date)}
          </p>
          <p>
            <span className={cls('font-medium text-blackout')}>Time:</span>{' '}
            {formatTime(event.start_time)} – {formatTime(event.end_time)}
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
        {eventWithSpeakers.speakers && eventWithSpeakers.speakers.length > 0 && (
          <div className={cls('mt-6 pt-6 border-t border-[#DADCE0]')}>
            <h2 className={cls('font-semibold text-blackout mb-2')}>Speakers</h2>
            <ul className={cls('space-y-2')}>
              {eventWithSpeakers.speakers.map((s, i) => (
                <li key={i} className={cls('text-solid-matte-gray')}>
                  {s.name}
                  {s.topic && ` — ${s.topic}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
