import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "OpenPrint3D — Open Standard for 3D Printing Profiles",
  description: "Browse, create, and share standardized 3D printing profiles for printers, filaments, and processes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('openprint3d-theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = theme === 'light' ? 'light' : theme === 'dark' ? 'dark' : systemDark ? 'dark' : 'light';
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider defaultTheme="system">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}