/**
 * Form Section Component
 * Reusable section wrapper with consistent styling for form pages
 */

import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
