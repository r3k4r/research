import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import { headers } from 'next/headers';
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "Second Serve",
  description: "this application is a Food Waste Reduction Platform designed to connect users with local restaurants, bakeries, and stores offering surplus food at discounted prices. The goal is to minimize food waste by making it easy for businesses to sell leftover food that would otherwise be discarded, while also helping users access affordable, high-quality meals. Here’s how it works: Businesses list surplus food items on the platform before they close or when items are near expiration. Users can browse available deals through an interactive map, set their preferred search radius, and view real-time offers from nearby stores. Instead of ordering online, users visit the physical location to purchase the food directly—no in-app payments required. This approach ensures food is sold fresh while cutting down on waste and benefiting both businesses and customers.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || 'nothing';
  console.log("pathname", pathname);
  
  const noNavbarRoutes = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/two-factor',
    '/welcome',
    '/admin-dashboard',
    '/provider-dashboard',
  ];

  const showNavbar = noNavbarRoutes.some(route => 
    pathname.startsWith(route) 
  );
  
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="dark:bg-dark10">
        <ThemeProvider>
          <SessionProviderWrapper session={session}>
            <CartProvider>
              {!showNavbar ?  <Navbar />: pathname === '/' ? <Navbar /> : null} 
              {children}
            </CartProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
