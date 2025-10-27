"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchCard() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (location) params.set("location", location);

    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border-4 border-ocean-400 p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:gap-6">
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-bold text-ocean-900">
            Role
          </label>
          <Input
            id="role"
            placeholder="e.g. surf coach, chef"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white border-2 border-ocean-300 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-12 text-base placeholder:text-muted-foreground/70 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-bold text-ocean-900">
            Location
          </label>
          <Input
            id="location"
            placeholder="e.g. Bali, Portugal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white border-2 border-ocean-300 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-12 text-base placeholder:text-muted-foreground/70 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <label className="text-sm font-medium opacity-0 hidden sm:block pointer-events-none">
            Search
          </label>
          <Button
            onClick={handleSearch}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[140px] gap-2 h-12 font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Search className="h-5 w-5" />
            Search Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}
