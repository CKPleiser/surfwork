"use client";

import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationButton } from "@/components/applications/application-button";

interface ContactButtonsProps {
  contactMethod: "email" | "whatsapp" | "link";
  contactValue: string;
  jobTitle: string;
  jobId: string;
}

export function ContactButtons({
  contactMethod,
  contactValue,
  jobTitle,
  jobId,
}: ContactButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Primary application button */}
      <ApplicationButton jobId={jobId} jobTitle={jobTitle} />

      {/* Alternative contact methods */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or contact directly
          </span>
        </div>
      </div>

      {contactMethod === "whatsapp" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.open(
              `https://wa.me/${contactValue.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi! I'm interested in the ${jobTitle} position.`)}`,
              "_blank"
            );
          }}
        >
          <MessageCircle className="h-4 w-4" />
          Message via WhatsApp
        </Button>
      )}

      {contactMethod === "email" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = `mailto:${contactValue}?subject=${encodeURIComponent(`Application: ${jobTitle}`)}&body=${encodeURIComponent("Hi,\n\nI'm interested in this position.\n\nBest regards")}`;
          }}
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      )}

      {contactMethod === "link" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.open(contactValue, "_blank");
          }}
        >
          Visit Application Page
        </Button>
      )}
    </div>
  );
}
