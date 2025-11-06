"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationMessageSchema, type ApplicationFormData } from "@/lib/validations/application";
import { useApplyToJob, useJobApplicationStatus } from "@/hooks/use-applications";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

interface ApplicationButtonProps {
  jobId: string;
  jobTitle: string;
}

export function ApplicationButton({ jobId, jobTitle }: ApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: applicationStatus, isLoading: statusLoading } = useJobApplicationStatus(jobId);
  const applyMutation = useApplyToJob();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(data: ApplicationFormData) {
    try {
      await applyMutation.mutateAsync({
        jobId,
        message: data.message,
      });

      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  }

  if (statusLoading) {
    return (
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (applicationStatus?.hasApplied) {
    return (
      <Button variant="secondary" disabled>
        <Check className="w-4 h-4 mr-2" />
        Applied
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Apply Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Send a message to the employer explaining why you&apos;re interested in this position.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Application Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience, skills, and why you're interested in this position..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write 50-500 characters about yourself and your interest.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applyMutation.isPending}>
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}