'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Event } from '@/lib/api';

function formatEventDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const AsteriskIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2V26M2 14H26M5.5 5.5L22.5 22.5M22.5 5.5L5.5 22.5"
      stroke="#34A853"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-400"
  >
    <path
      d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EventsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getEvents({ limit: 6 })
      .then((list) => setEvents(Array.isArray(list) ? list : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = searchQuery.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : events;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-[#F8F8F8] px-6 py-16 md:px-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <AsteriskIcon />
            <h2 className="text-xl font-normal leading-tight text-blackout md:text-3xl">
              Stop Scrolling, Start Learning:
              <br />
              The Next Event is Happening!
            </h2>
          </div>

          <div className="md:max-w-sm">
            <p className="mb-4 text-sm text-solid-matte-gray">
              From zero to shipping code in one weekend. Learn new skills, meet your people, or
              just show up for the vibes. No FOMO allowed.
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="search for events in the campus"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-blackout placeholder-gray-400 outline-none transition-all focus:border-alexandra focus:ring-1 focus:ring-alexandra"
                style={{ paddingLeft: '2.5rem' }}
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Event Cards */}
        <div
          ref={scrollContainerRef}
          className="mb-8 flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            <p className="text-sm text-solid-matte-gray py-8">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-sm text-solid-matte-gray py-8">No events found.</p>
          ) : (
            filteredEvents.map((event) => (
              <article
                key={event.id}
                className="min-w-[300px] flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md md:min-w-[340px]"
              >
                {/* Event Image */}
                <div className="relative h-44 w-full bg-[#E0E0E0]">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-solid-matte-gray">Event</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="mb-4 min-h-[3.5rem] text-base font-medium leading-snug text-blackout">
                    {event.title}
                  </h3>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-blackout">{formatEventDate(event.date)}</p>
                      {event.location && (
                        <p className="text-sm text-alexandra">{event.location}</p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="rounded-md bg-blackout px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blackout/90"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-alexandra hover:text-alexandra"
            aria-label="Previous events"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-alexandra hover:text-alexandra"
            aria-label="Next events"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

