'use client';

import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { Drawer } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { cls } from '@/utils';

const adminLinks = [
  { target: '/admin', label: 'Dashboard' },
  { target: '/admin', label: 'Users' },
  { target: '/admin/blog', label: 'Blog' },
  { target: '/admin/events', label: 'Events' },
  { target: '/admin/projects', label: 'Projects' },
  { target: '#', label: 'Log out' },
];

export function AdminHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout, isHydrated } = useAuth();

  const handleNavClick = (item: (typeof adminLinks)[0]) => {
    if (item.label === 'Log out') {
      logout();
      window.location.href = '/';
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderBottomRightRadius: '32px',
              borderTopRightRadius: '32px',
              backgroundColor: 'white',
              width: 'min(320px, 85vw)',
            },
          },
        }}
      >
        <aside className="flex h-full flex-col bg-white p-6 border-r border-[#DADCE0]">
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" onClick={() => setIsDrawerOpen(false)}>
              <Image
                alt="GDG UNN Logo"
                src="/graphics/logo-banner.svg"
                height={52}
                width={220}
                className="h-11 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 -m-2 text-solid-matte-gray hover:text-blackout"
              aria-label="Close menu"
            >
              <ReactSVG src="/graphics/close.svg" />
            </button>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-alexandra mb-4">
            Admin
          </span>
          <nav className="flex flex-col gap-1">
            {isHydrated &&
              adminLinks.map(({ target, label }) =>
                label === 'Log out' ? (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleNavClick({ target, label })}
                    className={cls(
                      'px-3 py-3 text-left rounded-lg text-solid-matte-gray hover:bg-red-50 hover:text-red-600 font-medium'
                    )}
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    onClick={() => setIsDrawerOpen(false)}
                    href={target}
                    key={label}
                    className={cls(
                      'px-3 py-3 rounded-lg text-blackout hover:bg-tech-white transition-colors'
                    )}
                  >
                    {label}
                  </Link>
                )
              )}
          </nav>
        </aside>
      </Drawer>
      <header
        className={cls(
          'sticky top-0 z-20 w-full border-b border-[#DADCE0]',
          'bg-white text-blackout shadow-sm'
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex shrink-0 items-center min-w-0 gap-3">
            <Image
              alt="GDG UNN Admin"
              src="/graphics/logo-banner.svg"
              height={48}
              width={220}
              className="h-10 w-auto max-w-[180px] sm:max-w-[220px]"
              priority
            />
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wider bg-alexandra/10 text-alexandra border border-alexandra/30">
              Admin
            </span>
          </Link>
          <nav className="flex flex-1 justify-end items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              {isHydrated &&
                adminLinks.map(({ target, label }) =>
                  label === 'Log out' ? (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleNavClick({ target, label })}
                      className={cls(
                        'px-3 py-2 rounded-lg text-sm font-medium',
                        'text-solid-matte-gray hover:bg-red-50 hover:text-red-600 transition-colors'
                      )}
                    >
                      {label}
                    </button>
                  ) : (
                    <Link
                      key={label}
                      href={target}
                      className={cls(
                        'px-3 py-2 rounded-lg text-sm font-medium',
                        'text-blackout hover:bg-tech-white transition-colors'
                      )}
                    >
                      {label}
                    </Link>
                  )
                )}
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -m-2 text-solid-matte-gray hover:text-blackout md:hidden"
              aria-label="Open menu"
            >
              <ReactSVG src="/graphics/menu.svg" className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
