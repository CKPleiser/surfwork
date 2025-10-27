"use client";

import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactButtonsProps {
  contactMethod: "email" | "whatsapp" | "link";
  contactValue: string;
  jobTitle: string;
}

export function ContactButtons({
  contactMethod,
  contactValue,
  jobTitle,
}: ContactButtonsProps) {
  if (contactMethod === "whatsapp") {
    return (
      <Button
        variant="default"
        className="w-full"
        onClick={() => {
          window.open(
            `https://wa.me/${contactValue.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi! I'm interested in the ${jobTitle} position.`)}`,
            "_blank"
          );
        }}
      >
        <MessageCircle className="h-4 w-4" />
        Apply via WhatsApp
      </Button>
    );
  }

  if (contactMethod === "email") {
    return (
      <Button
        variant="default"
        className="w-full"
        onClick={() => {
          window.location.href = `mailto:${contactValue}?subject=${encodeURIComponent(`Application: ${jobTitle}`)}&body=${encodeURIComponent("Hi,\n\nI'm interested in this position.\n\nBest regards")}`;
        }}
      >
        <Mail className="h-4 w-4" />
        Send Application
      </Button>
    );
  }

  if (contactMethod === "link") {
    return (
      <Button
        variant="default"
        className="w-full"
        onClick={() => {
          window.open(contactValue, "_blank");
        }}
      >
        Apply Now
      </Button>
    );
  }

  return null;
}
