import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";


export const metadata = {
  title: "Second Serve",
  description: "this application is a Food Waste Reduction Platform designed to connect users with local restaurants, bakeries, and stores offering surplus food at discounted prices. The goal is to minimize food waste by making it easy for businesses to sell leftover food that would otherwise be discarded, while also helping users access affordable, high-quality meals. Here’s how it works: Businesses list surplus food items on the platform before they close or when items are near expiration. Users can browse available deals through an interactive map, set their preferred search radius, and view real-time offers from nearby stores. Instead of ordering online, users visit the physical location to purchase the food directly—no in-app payments required. This approach ensures food is sold fresh while cutting down on waste and benefiting both businesses and customers.",
};

export default function RootLayout({ children, session }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={session}>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
