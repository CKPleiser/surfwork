"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthButton } from "@/components/AuthButton";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Jobs" },
    { href: "/organizations", label: "Companies" },
    { href: "/resources", label: "Resources" },
    { href: "/crew", label: "Crew" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`sticky top-0 z-50 w-full bg-white border-b-2 border-border transition-all duration-200 ${scrolled ? "shadow-lg" : ""}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Waves className="h-7 w-7 text-ocean-500 transition-all group-hover:scale-110 group-hover:text-ocean-600" />
            <span className="text-xl font-bold tracking-tight bg-gradient-ocean bg-clip-text text-transparent">surfwork</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-ocean-600 ${
                  isActive(link.href) ? "text-ocean-600 font-bold" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 h-11 w-11 flex items-center justify-center text-foreground hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-down">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div onClick={() => setMobileMenuOpen(false)}>
                <AuthButton />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
