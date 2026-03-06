import { motion } from "framer-motion";
import { Calendar, MoreVertical, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type TaskResponse } from "@shared/routes";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  index: number;
}

export function TaskCard({ task, onEdit, index }: TaskCardProps) {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const isCompleted = task.status === 'completed';

  const toggleStatus = () => {
    updateMutation.mutate({
      id: task.id,
      status: isCompleted ? 'pending' : 'completed'
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(task.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 border border-border/50 shadow-sm",
        isCompleted ? "bg-muted/30" : "bg-card hover:shadow-md hover:border-border/80"
      )}>
        {isCompleted && (
          <div className="absolute inset-y-0 left-0 w-1 bg-green-500/50" />
        )}
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <button 
              onClick={toggleStatus}
              disabled={updateMutation.isPending}
              className={cn(
                "mt-0.5 flex-shrink-0 transition-colors duration-200",
                isCompleted ? "text-green-500" : "text-muted-foreground hover:text-primary"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-display font-semibold text-lg mb-1 transition-colors duration-200 truncate",
                isCompleted ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "text-sm line-clamp-2 mb-3",
                  isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
                )}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground gap-2 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "No date"}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-border/50">
                  <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer gap-2 py-2.5">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                    <span>Edit Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Task</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
