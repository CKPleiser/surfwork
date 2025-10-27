import Link from "next/link";
import { Heart, Instagram, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-border bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="h-6 w-6 text-ocean-500" />
              <span className="text-xl tracking-tight font-bold bg-gradient-ocean bg-clip-text text-transparent">surfwork</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Real surf jobs, no spam. Built by the community, for the community.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-ocean-600 transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/crew" className="hover:text-ocean-600 transition-colors">
                  Find Crew
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-ocean-600 transition-colors">
                  Organizations
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ocean-600 transition-colors">
                  Post a Job
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-ocean-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ocean-600 transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ocean-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Support Surf Work</h4>
            <p className="text-sm text-muted-foreground">
              Help us keep the platform free and accessible.
            </p>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              Donate
            </Button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t-2 border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Surf Work. Built with care by surfers.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">This week&apos;s supporter: Maria from Ericeira 🌊</p>
            <a
              href="https://instagram.com/surfwork.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-500 hover:text-ocean-600 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
