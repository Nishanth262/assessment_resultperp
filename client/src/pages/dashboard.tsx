import { useState } from "react";
import { Plus, ListTodo, Search } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type TaskResponse } from "@shared/routes";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: tasks, isLoading } = useTasks();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskResponse | null>(null);

  const filteredTasks = tasks?.filter((t) => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    (t.description?.toLowerCase() || "").includes(search.toLowerCase())
  ) || [];

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const openEditDialog = (task: TaskResponse) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-card rounded-2xl border border-border/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            My Tasks
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            You have {pendingTasks.length} pending tasks to complete.
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border/50 focus-visible:ring-primary/20 rounded-xl"
            />
          </div>
          <Button onClick={openCreateDialog} className="rounded-xl px-5 gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      {tasks?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50 shadow-sm"
        >
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Get started by creating your first task. Organize your workflow efficiently.
          </p>
          <Button onClick={openCreateDialog} className="rounded-xl shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Create First Task
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {pendingTasks.length > 0 && (
            <section>
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Pending
                <span className="ml-2 py-0.5 px-2.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                  {pendingTasks.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingTasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} onEdit={openEditDialog} />
                ))}
              </div>
            </section>
          )}

          {completedTasks.length > 0 && (
            <section>
              <h3 className="font-display text-lg font-semibold mb-4 text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                Completed
                <span className="ml-2 py-0.5 px-2.5 rounded-full bg-secondary/50 text-xs font-medium">
                  {completedTasks.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-80">
                {completedTasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} onEdit={openEditDialog} />
                ))}
              </div>
            </section>
          )}

          {filteredTasks.length === 0 && tasks.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks matching "{search}"</p>
            </div>
          )}
        </div>
      )}

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={taskToEdit} 
      />
    </div>
  );
}
