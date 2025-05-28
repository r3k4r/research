"use client";

import { usePathname } from 'next/navigation';

export default function NavbarWrapper({ children }) {
  const pathname = usePathname();
  
  const noNavbarRoutes = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/welcome',
    '/admin-dashboard',
    '/provider-dashboard',
  ];

  // Check if current pathname starts with any route in noNavbarRoutes
  const shouldHideNavbar = noNavbarRoutes.some(route => 
    pathname?.startsWith(route)
  );
  
  // Show navbar on home page or when not in a noNavbarRoute
  if (pathname === '/' || !shouldHideNavbar) {
    return children;
  }
  
  // Otherwise, return null to hide the navbar
  return null;
}
