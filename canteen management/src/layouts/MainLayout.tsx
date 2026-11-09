import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { CartDrawer } from '@/components/student/CartDrawer';
import { Footer } from '@/components/common/Footer';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  // Determine section title from path
  let sectionTitle = '';
  if (location.pathname === '/menu') sectionTitle = 'Menu';
  else if (location.pathname.startsWith('/orders') || location.pathname.startsWith('/token'))
    sectionTitle = 'Live Token';
  else if (location.pathname === '/kitchen') sectionTitle = 'Kitchen Ops';
  else if (location.pathname === '/staff') sectionTitle = 'Staff Counter';
  else if (location.pathname.startsWith('/admin')) sectionTitle = 'Administration';
  else if (location.pathname === '/profile') sectionTitle = 'Profile';
  else if (location.pathname === '/settings') sectionTitle = 'Settings';

  const isKitchenDisplay = location.pathname === '/kitchen';

  if (isKitchenDisplay) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-[#121212] text-on-surface dark:text-neutral-100 transition-colors">
      <Navbar currentSectionTitle={sectionTitle} />

      <main className="flex-1 w-full pt-24">
        <Outlet />
      </main>

      <CartDrawer />
      <BottomNav />
      <Footer />
    </div>
  );
};

