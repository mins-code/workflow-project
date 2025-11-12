import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, CheckSquare, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Id } from "@/convex/_generated/dataModel";

export default function Tasks() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const tasks = useQuery(api.tasks.list, {});
  const projects = useQuery(api.projects.list);
  const createTask = useMutation(api.tasks.create);
  const updateStatus = useMutation(api.tasks.updateStatus);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    estimatedHours: 0,
    dueDate: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Loader2 className="h-8 w-8 animate-spin text-primary cyber-glow" />
      </div>
    );
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId as Id<"projects">,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours,
        dueDate: new Date(formData.dueDate).getTime(),
      });
      toast.success("Task created successfully!");
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        estimatedHours: 0,
        dueDate: "",
      });
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: "todo" | "in_progress" | "review" | "completed") => {
    try {
      await updateStatus({ taskId, status: newStatus });
      toast.success("Task status updated!");
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-destructive";
      case "high": return "text-secondary";
      case "medium": return "text-accent";
      case "low": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-accent" />;
      case "in_progress": return <Clock className="h-4 w-4 text-primary" />;
      case "review": return <AlertCircle className="h-4 w-4 text-secondary" />;
      default: return <CheckSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredTasks = selectedProject
    ? tasks?.filter(task => task.projectId === selectedProject)
    : tasks;

  const todoTasks = filteredTasks?.filter(t => t.status === "todo") || [];
  const inProgressTasks = filteredTasks?.filter(t => t.status === "in_progress") || [];
  const reviewTasks = filteredTasks?.filter(t => t.status === "review") || [];
  const completedTasks = filteredTasks?.filter(t => t.status === "completed") || [];

  const TaskCard = ({ task }: { task: any }) => (
    <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{task.projectName}</span>
          <span className="text-muted-foreground">{task.assigneeName}</span>
        </div>
        <div className="flex gap-1 pt-2">
          {task.status !== "todo" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(task._id, "todo")}
              className="text-xs h-7"
            >
              To Do
            </Button>
          )}
          {task.status !== "in_progress" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(task._id, "in_progress")}
              className="text-xs h-7"
            >
              In Progress
            </Button>
          )}
          {task.status !== "review" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(task._id, "review")}
              className="text-xs h-7"
            >
              Review
            </Button>
          )}
          {task.status !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange(task._id, "completed")}
              className="text-xs h-7"
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen cyber-grid scanline">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold cyber-text text-primary mb-2">
              Tasks
            </h1>
            <p className="text-muted-foreground">
              Manage and track all your tasks
            </p>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Task Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Task description"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Project</label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Estimated Hours</label>
                      <Input
                        type="number"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="board" className="w-full">
          <TabsList>
            <TabsTrigger value="board">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="board" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  To Do ({todoTasks.length})
                </h3>
                {todoTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  In Progress ({inProgressTasks.length})
                </h3>
                {inProgressTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-secondary" />
                  Review ({reviewTasks.length})
                </h3>
                {reviewTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Completed ({completedTasks.length})
                </h3>
                {completedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <div className="space-y-3">
              {filteredTasks?.map((task) => (
                <Card key={task._id} className="border-primary/50 cyber-glow bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.projectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.assigneeName}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
