"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme, ThemeToggle } from "./theme-provider";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/filaments", label: "Filaments" },
    { href: "/printers", label: "Printers" },
    { href: "/processes", label: "Processes" },
    { href: "/relations", label: "Relations" },
    { href: "/create", label: "Create" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 glass transition-shadow ${scrolled ? "shadow-lg" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-lg shadow-accent/25">
              OP
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Open<span className="text-accent">Print3D</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              href="/export"
              className="text-sm px-4 py-2 bg-accent/10 text-accent border border-accent/30 rounded-xl hover:bg-accent/20 hover:border-accent/50 transition-all duration-200"
            >
              Export to Slicer
            </Link>
            <ThemeToggle />
            <a
              href="https://github.com/OpenPrint3D/OpenPrint3D"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu open md:hidden">
          <div className="flex flex-col pt-16 px-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-lg font-medium text-foreground hover:bg-card-hover rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border my-4" />
            <Link
              href="/export"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-medium text-accent bg-accent/10 rounded-xl text-center"
            >
              Export to Slicer
            </Link>
            <a
              href="https://github.com/OpenPrint3D/OpenPrint3D"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 text-lg font-medium text-muted hover:text-foreground rounded-xl text-center"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </>
  );
}