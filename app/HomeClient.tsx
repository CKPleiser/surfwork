"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { X, Search as SearchIcon, Bell, MapPin, Home, DollarSign } from "lucide-react";
import type { Job } from "@/app/actions/jobs";
import { HOME_ROLES, HOME_ROLE_LABELS, HOME_TAGS } from "@/lib/constants";

interface HomeClientProps {
  initialJobs: Job[];
}

export function HomeClient({ initialJobs }: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobs = initialJobs;

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterFrequency, setNewsletterFrequency] = useState("weekly");

  // Initialize filters from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedRole, setSelectedRole] = useState<string>(searchParams.get("role") || "all");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [accommodationFilter, setAccommodationFilter] = useState<string>(
    searchParams.get("accommodation") || "all"
  );
  const [sortBy, setSortBy] = useState("newest");

  // Update URL params when filters change
  // Debounced URL sync to prevent excessive router.replace calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedRole !== "all") params.set("role", selectedRole);
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      if (locationFilter) params.set("location", locationFilter);
      if (accommodationFilter !== "all") params.set("accommodation", accommodationFilter);

      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(newUrl, { scroll: false });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, selectedTags, locationFilter, accommodationFilter, router]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Memoize filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    // Pre-compute lowercase filter values to avoid repeated toLowerCase() calls
    const searchLower = searchQuery.toLowerCase();
    const locationFilterLower = locationFilter.toLowerCase();
    const selectedTagsLower = selectedTags.map(t => t.toLowerCase());

    let filtered = jobs.filter((job) => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower);
      const matchesRole = selectedRole === "all" || job.role === selectedRole;
      const matchesTags = selectedTags.length === 0 ||
        selectedTagsLower.some((tag) =>
          job.tags.some(t => t.toLowerCase() === tag)
        );
      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilterLower);
      const matchesAccommodation =
        accommodationFilter === "all" ||
        (accommodationFilter === "yes" && job.accommodation) ||
        (accommodationFilter === "no" && !job.accommodation);

      return matchesSearch && matchesRole && matchesTags && matchesLocation && matchesAccommodation;
    });

    // Sort jobs
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return filtered;
  }, [jobs, searchQuery, selectedRole, selectedTags, locationFilter, accommodationFilter, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedTags([]);
    setLocationFilter("");
    setAccommodationFilter("all");
  }, []);

  const hasActiveFilters = searchQuery || selectedRole !== "all" || selectedTags.length > 0 || locationFilter || accommodationFilter !== "all";

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  const handleLocationClick = (location: string) => {
    setLocationFilter(location);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Mission Banner */}
      <section className="bg-gradient-to-r from-ocean-600 via-ocean-500 to-teal-500 text-white py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm sm:text-base">
            <span className="font-semibold">Real surf jobs from real surf businesses.</span>{" "}
            <span className="text-white/90">No recruiters. No spam. No BS.</span>{" "}
            <Link href="/jobs/new" prefetch={true} className="text-white underline decoration-2 underline-offset-2 hover:text-white/90 font-medium">
              Post a job for free
            </Link>
          </p>
        </div>
      </section>

      {/* Hero with Surf Photography */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image - Surf Photography */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1502933691298-84fc14542831?q=80&w=2940&auto=format&fit=crop"
            alt="Surfer on wave"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient Overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/30 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              Find your next
              <br />
              <span className="relative inline-block">
                surf season
                <svg
                  className="absolute -bottom-3 left-0 w-full h-4 text-secondary drop-shadow-lg"
                  viewBox="0 0 300 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8C50 4 100 11 150 7C200 3 250 10 298 7"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 mb-10 drop-shadow-lg font-light">
              Coaching positions, media roles, and camp staff opportunities worldwide
            </p>

            {/* Newsletter Signup Box */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl border border-white/20">
              <div className="flex items-start gap-3 mb-5">
                <Bell className="h-6 w-6 text-ocean-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Get new jobs in your inbox</h3>
                  <p className="text-gray-600 text-sm">Never miss an opportunity</p>
                </div>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["weekly", "daily", "all"].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setNewsletterFrequency(freq)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        newsletterFrequency === freq
                          ? "bg-ocean-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {freq === "weekly" ? "Weekly digest" : freq === "daily" ? "Daily updates" : "Every new job"}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 h-12 bg-white border-2 border-gray-200 focus:border-ocean-500 text-base"
                    required
                  />
                  <Button type="submit" size="lg" className="bg-secondary hover:bg-secondary/90 text-white h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Subscribe
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Wave Transition Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0 60 Q 300 100 600 60 T 1200 60 L 1200 120 L 0 120 Z" fill="#fdfbf7" />
          </svg>
        </div>
      </section>

      {/* Main Search + Results */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-500" />
              <Input
                placeholder="Search jobs, locations, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg focus:shadow-lg focus:border-ocean-400 transition-all bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Filters Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-24 shadow-lg">
                <h3 className="font-bold text-xl mb-6 text-gray-900">Filters</h3>

                <div className="space-y-6">
                  {/* Role Filter */}
                  <div>
                    <Label className="mb-3 block font-semibold">Role</Label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                    >
                      {HOME_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {HOME_ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <Label htmlFor="location-filter" className="mb-3 block font-semibold">
                      Location
                    </Label>
                    <Input
                      id="location-filter"
                      placeholder="e.g. Portugal"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="border-2"
                    />
                  </div>

                  {/* Accommodation Filter */}
                  <div>
                    <Label className="mb-3 block font-semibold">Accommodation</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={accommodationFilter === "all" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 transition-colors"
                        onClick={() => setAccommodationFilter("all")}
                      >
                        All
                      </Badge>
                      <Badge
                        variant={accommodationFilter === "yes" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 transition-colors"
                        onClick={() => setAccommodationFilter("yes")}
                      >
                        Provided
                      </Badge>
                      <Badge
                        variant={accommodationFilter === "no" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 transition-colors"
                        onClick={() => setAccommodationFilter("no")}
                      >
                        Not provided
                      </Badge>
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <Label className="mb-3 block font-semibold">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {HOME_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/90 transition-colors"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                          {selectedTags.includes(tag) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>

                {/* Post Job CTA */}
                <div className="mt-8 pt-6 border-t-2 border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Have a position to fill?
                  </p>
                  <Link href="/jobs/new" prefetch={true}>
                    <Button variant="outline" className="w-full border-2">
                      Post a Job
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Jobs List */}
            <main>
              <div className="flex items-center justify-between mb-6">
                <p className="text-base">
                  <span className="font-semibold text-foreground">{filteredJobs.length}</span>{" "}
                  <span className="text-muted-foreground">{filteredJobs.length === 1 ? "job" : "jobs"} found</span>
                </p>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white border-2 border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

              {filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block group"
                    >
                      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-ocean-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        {/* Subtle wave pattern overlay */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                          <svg viewBox="0 0 100 100" className="text-ocean-500">
                            <path d="M0 50 Q 25 30 50 50 T 100 50 L 100 100 L 0 100 Z" fill="currentColor" />
                          </svg>
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Camp Name */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-ocean-500 to-teal-500 text-white text-xs font-bold uppercase tracking-wide mb-3 shadow-md">
                              {job.campName}
                            </div>

                            {/* Job Title */}
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-ocean-600 transition-colors mb-3">
                              {job.title}
                            </h3>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-5 text-base text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-ocean-500" />
                                <span className="font-medium">{job.location}</span>
                              </div>
                              {job.accommodation && (
                                <div className="flex items-center gap-2">
                                  <Home className="h-5 w-5 text-teal-500" />
                                  <span className="font-medium">Housing included</span>
                                </div>
                              )}
                              {job.pay && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-secondary" />
                                  <span className="font-semibold">{job.pay}</span>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {job.tags && job.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 bg-ocean-50 text-ocean-700 hover:bg-ocean-100 border border-ocean-200">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-border">
                  <div className="text-6xl mb-4">🏄</div>
                  <h3 className="text-2xl font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or check back later
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-2"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Jobs by Location Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background with Beach Photography */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2940&auto=format&fit=crop"
            alt="Beach aerial view"
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sand-50 via-sand-50/95 to-sand-50" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center text-gray-900">
            <span className="relative inline-block">
              Explore by location
              <svg
                className="absolute -bottom-2 left-0 w-full h-4 text-secondary"
                viewBox="0 0 300 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8C50 5 100 11 150 7C200 3 250 9 298 7"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Find opportunities in paradise destinations worldwide</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* By Region - with ocean image */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126&auto=format&fit=crop"
                  alt="World map"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-ocean-600/80 to-ocean-900/90" />
              </div>
              <div className="relative p-8 text-white min-h-[320px] flex flex-col">
                <h3 className="font-bold text-2xl mb-6">By Region</h3>
                <ul className="space-y-3 flex-1">
                  <li>
                    <button
                      onClick={() => handleLocationClick("Europe")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Europe
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLocationClick("Asia")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Asia & Pacific
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLocationClick("America")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Americas
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLocationClick("Africa")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Africa
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLocationClick("Oceania")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Oceania
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Popular Destinations - with tropical beach */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2940&auto=format&fit=crop"
                  alt="Tropical beach"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-teal-600/80 to-teal-900/90" />
              </div>
              <div className="relative p-8 text-white min-h-[320px] flex flex-col">
                <h3 className="font-bold text-2xl mb-6">Top Destinations</h3>
                <ul className="space-y-3 flex-1">
                  {["Portugal", "Bali", "Costa Rica", "Morocco", "France", "Indonesia"].map((location) => (
                    <li key={location}>
                      <button
                        onClick={() => handleLocationClick(location)}
                        className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                      >
                        <span className="text-secondary">→</span> {location}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Work Style - with sunset surf */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2940&auto=format&fit=crop"
                  alt="Sunset surf"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-orange-600/80 to-orange-900/90" />
              </div>
              <div className="relative p-8 text-white min-h-[320px] flex flex-col">
                <h3 className="font-bold text-2xl mb-6">Work Style</h3>
                <ul className="space-y-3 flex-1">
                  <li>
                    <button
                      onClick={() => handleLocationClick("Remote")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Remote positions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setAccommodationFilter("yes")}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> With housing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedRole("coach");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Coaching roles
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setSelectedRole("media");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-white/95 hover:text-white hover:translate-x-1 transition-all text-left w-full font-medium flex items-center gap-2 text-lg"
                    >
                      <span className="text-secondary">→</span> Media & content
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
