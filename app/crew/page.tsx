"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, User, Building2 } from "lucide-react";

export default function CrewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-sand-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Grow Cycling Style */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            The right people for your next season
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Coaches, chefs, photographers, hosts and more — connect directly with crew who know surf culture and camp life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/organizations/signup")}
              className="gap-2 px-8 text-base"
            >
              <Building2 className="h-5 w-5" />
              Meet the crew
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/crew/signup")}
              className="border-2 px-8 text-base"
            >
              <User className="h-5 w-5" />
              I&apos;m looking for work
            </Button>
          </div>
        </div>

        {/* Preview Teaser - Grow Cycling style */}
        <div className="mt-16 max-w-4xl mx-auto">
            {/* Candidates preview */}
            <div className="space-y-4 mb-8">
              {/* Candidate rows */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1535923133811-e0e59e3e6c13?w=200&h=200&fit=crop&q=80"
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold mb-1 blur-sm select-none">Sarah Mitchell</p>
                  <p className="text-gray-700 mb-2">Surf Coach & ISA Instructor @ Endless Summer Surf Camp</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600 text-sm">Bali, Indonesia</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">ISA Certified</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Surf Coaching</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Safety Training</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="whitespace-nowrap pointer-events-none cursor-default opacity-60" disabled>
                  View profile
                </Button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80"
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold mb-1 blur-sm select-none">Maria Santos</p>
                  <p className="text-gray-700 mb-2">Surf Photographer & Content Creator @ Wave Hunters Media</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600 text-sm">Ericeira, Portugal</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Photography</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Video Editing</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Social Media</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="whitespace-nowrap pointer-events-none cursor-default opacity-60" disabled>
                  View profile
                </Button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80"
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold mb-1 blur-sm select-none">Ahmed Hassan</p>
                  <p className="text-gray-700 mb-2">Camp Manager & Operations Lead @ Taghazout Surf Experience</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600 text-sm">Taghazout, Morocco</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Camp Management</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Operations</Badge>
                    <Badge variant="secondary" className="text-xs bg-ocean-50 text-ocean-700 border border-ocean-200">Team Leadership</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="whitespace-nowrap pointer-events-none cursor-default opacity-60" disabled>
                  View profile
                </Button>
              </div>
            </div>

            {/* More candidates - avatar row */}
            <div className="flex justify-center items-center flex-wrap gap-0">
              {[
                'https://images.unsplash.com/photo-1535923133811-e0e59e3e6c13?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80'
              ].map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt=""
                  className="w-12 h-12 rounded-full -ml-2 first:ml-0 object-cover border-2 border-white"
                />
              ))}
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              And plenty more...
            </p>
        </div>

        {/* How it works section */}
        <div className="mt-20 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">
                How it works
              </h2>
              <p className="text-xl text-gray-600">
                Real surf crew. Direct connections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-ocean-100 text-ocean-600 font-bold text-2xl">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Skilled people join our community
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Coaches, chefs, photographers, hosts and more create profiles that highlight their experience and availability.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-ocean-100 text-ocean-600 font-bold text-2xl">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  You find the right crew for your camp
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Search and browse profiles by role, skills, and region — see who&apos;s ready for the new season.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-ocean-100 text-ocean-600 font-bold text-2xl">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Contact directly and hire with confidence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Reach out, start a conversation, and build a team that understands surf culture and camp life.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={() => router.push("/organizations/signup")}
                className="gap-2 px-8 text-base"
              >
                <Building2 className="h-5 w-5" />
                Meet the crew
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
