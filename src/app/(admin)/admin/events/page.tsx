'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';
import type { Event } from '@/lib/api';
import { cls } from '@/utils';

export default function AdminEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getEvents({ limit: 100 });
      setEvents(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!token || !confirm('Delete this event?')) return;
    setActionLoading(eventId);
    try {
      await api.deleteEvent(eventId, token);
      loadEvents();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-NG', { dateStyle: 'medium' });

  return (
    <div className={cls('space-y-6')}>
      <div className={cls('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4')}>
        <h1 className={cls('text-2xl font-semibold text-blackout')}>Events management</h1>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className={cls(
            'px-4 py-2 rounded-lg font-medium bg-alexandra text-white',
            'hover:bg-[#357AE8] transition-colors'
          )}
        >
          Create event
        </button>
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
        ) : events.length === 0 ? (
          <div className={cls('p-8 text-center text-solid-matte-gray')}>
            No events yet. Create one to get started.
          </div>
        ) : (
          <div className={cls('overflow-x-auto')}>
            <table className={cls('w-full text-left')}>
              <thead>
                <tr className={cls('bg-tech-white border-b border-[#DADCE0]')}>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Title</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Date</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Location</th>
                  <th className={cls('px-4 py-3 font-medium text-blackout')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className={cls('border-b border-[#DADCE0] hover:bg-tech-white/50')}>
                    <td className={cls('px-4 py-3')}>
                      <Link
                        href={`/dashboard/events/${ev.id}`}
                        className={cls('text-alexandra hover:underline font-medium')}
                      >
                        {ev.title}
                      </Link>
                    </td>
                    <td className={cls('px-4 py-3 text-sm text-solid-matte-gray')}>
                      {formatDate(ev.date)}
                    </td>
                    <td className={cls('px-4 py-3 text-sm text-solid-matte-gray')}>
                      {ev.location ?? '—'}
                    </td>
                    <td className={cls('px-4 py-3 flex gap-2')}>
                      <Link
                        href={`/dashboard/events/${ev.id}`}
                        className={cls('text-alexandra hover:underline text-sm font-medium')}
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingEvent(ev)}
                        disabled={!!actionLoading}
                        className={cls(
                          'text-alexandra hover:underline text-sm font-medium disabled:opacity-60'
                        )}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        disabled={!!actionLoading}
                        className={cls(
                          'text-red-600 hover:underline text-sm font-medium disabled:opacity-60'
                        )}
                      >
                        {actionLoading === ev.id ? '...' : 'Delete'}
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
        <CreateEventModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadEvents();
          }}
          onError={(msg) => setError(msg)}
        />
      )}
      {editingEvent && token && (
        <EditEventModal
          event={editingEvent}
          token={token}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null);
            loadEvents();
          }}
          onError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}

function CreateEventModal({
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
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    onError('');
    try {
      await api.createEvent(
        {
          title: title.trim(),
          description: description.trim() || null,
          date,
          start_time: startTime,
          end_time: endTime,
          location: location.trim() || null,
          image_url: imageUrl.trim() || null,
        },
        token
      );
      onSuccess();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Failed to create event');
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
          'bg-white rounded-xl shadow-lg max-w-md w-full p-6',
          'border border-[#DADCE0]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cls('text-xl font-semibold text-blackout mb-4')}>Create event</h2>
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
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('grid grid-cols-2 gap-4')}>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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

function EditEventModal({
  event,
  token,
  onClose,
  onSuccess,
  onError,
}: {
  event: Event;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(
    typeof event.start_time === 'string' && event.start_time.length >= 5
      ? event.start_time.slice(0, 5)
      : '09:00'
  );
  const [endTime, setEndTime] = useState(
    typeof event.end_time === 'string' && event.end_time.length >= 5
      ? event.end_time.slice(0, 5)
      : '17:00'
  );
  const [location, setLocation] = useState(event.location ?? '');
  const [imageUrl, setImageUrl] = useState(event.image_url ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    onError('');
    try {
      await api.updateEvent(
        event.id,
        {
          title: title.trim(),
          description: description.trim() || null,
          date,
          start_time: startTime,
          end_time: endTime,
          location: location.trim() || null,
          image_url: imageUrl.trim() || null,
        },
        token
      );
      onSuccess();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Failed to update event');
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
          'bg-white rounded-xl shadow-lg max-w-md w-full p-6',
          'border border-[#DADCE0]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={cls('text-xl font-semibold text-blackout mb-4')}>Edit event</h2>
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
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div className={cls('grid grid-cols-2 gap-4')}>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
            <div>
              <label className={cls('block text-sm font-medium text-blackout mb-1')}>End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cls(
                  'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-alexandra'
                )}
              />
            </div>
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cls(
                'w-full px-3 py-2 border border-[#DADCE0] rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-alexandra'
              )}
            />
          </div>
          <div>
            <label className={cls('block text-sm font-medium text-blackout mb-1')}>Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
