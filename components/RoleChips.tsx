"use client";

import { cn } from "@/lib/utils";

interface RoleChipsProps {
  selectedRole?: string;
  onRoleSelect: (role: string | undefined) => void;
  className?: string;
}

const ROLES = [
  { value: "coach", label: "Coach", icon: "🏄" },
  { value: "media", label: "Media", icon: "📸" },
  { value: "camp_staff", label: "Camp Staff", icon: "🏕️" },
  { value: "ops", label: "Operations", icon: "⚙️" },
  { value: "other", label: "Other", icon: "➕" },
] as const;

export function RoleChips({ selectedRole, onRoleSelect, className }: RoleChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {/* All Roles chip */}
      <button
        onClick={() => onRoleSelect(undefined)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
          "border-2 hover:scale-105 hover:shadow-md",
          !selectedRole
            ? "bg-gradient-ocean text-white border-ocean-600 shadow-lg shadow-ocean-500/20"
            : "bg-white text-ocean-700 border-ocean-200 hover:border-ocean-300"
        )}
      >
        <span>✨</span>
        <span>All Roles</span>
      </button>

      {/* Role chips */}
      {ROLES.map((role) => (
        <button
          key={role.value}
          onClick={() =>
            onRoleSelect(selectedRole === role.value ? undefined : role.value)
          }
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            "border-2 hover:scale-105 hover:shadow-md",
            selectedRole === role.value
              ? "bg-gradient-ocean text-white border-ocean-600 shadow-lg shadow-ocean-500/20"
              : "bg-white text-ocean-700 border-ocean-200 hover:border-ocean-300"
          )}
        >
          <span>{role.icon}</span>
          <span>{role.label}</span>
        </button>
      ))}
    </div>
  );
}
