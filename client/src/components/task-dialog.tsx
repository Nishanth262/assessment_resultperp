import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { type TaskResponse } from "@shared/routes";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskResponse | null;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const isEditing = !!task;
  
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description || "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
        });
      }
    }
  }, [open, task, form]);

  const onSubmit = async (values: TaskFormValues) => {
    if (isEditing && task) {
      await updateMutation.mutateAsync({ id: task.id, ...values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 shadow-2xl border-border/50">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your task details below." 
              : "Add a new task to your workspace."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Task Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., Complete project proposal" 
                      className="rounded-xl h-11 focus-visible:ring-primary/20 bg-background" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any extra details here..." 
                      className="resize-none rounded-xl min-h-[120px] focus-visible:ring-primary/20 bg-background" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl px-6"
                disabled={isPending}
              >
                {isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Task")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
