import { useState } from 'react';

import { Drawer } from '@mui/material';

export const AppHeader = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'transparent',
              scrollbarWidth: 'none'
            }
          }
        }}
      >
        <aside className="relative flex h-full w-full max-w-100 flex-col rounded-r-4xl bg-white pt-4 pb-6 font-medium"></aside>
      </Drawer>
      <header className="text-yankees-blue sticky top-0 right-0 left-0 z-20 flex h-16 w-full max-w-94 items-center justify-between pr-6 font-medium transition-all duration-200 ease-in-out md:h-28 md:max-w-360 md:px-10"></header>
    </>
  );
};
