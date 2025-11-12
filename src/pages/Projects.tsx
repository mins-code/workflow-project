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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, FolderKanban, Calendar, Users, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { Id } from "@/convex/_generated/dataModel";

export default function Projects() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list);
  const teams = useQuery(api.teams.list);
  const users = useQuery(api.users.currentUser);
  const createProject = useMutation(api.projects.create);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    startDate: "",
    endDate: "",
    managerId: "",
    teamId: "",
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        managerId: formData.managerId as Id<"users">,
        teamId: formData.teamId as Id<"teams">,
      });
      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        startDate: "",
        endDate: "",
        managerId: "",
        teamId: "",
      });
    } catch (error) {
      toast.error("Failed to create project");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-accent";
      case "planning": return "text-primary";
      case "on-hold": return "text-secondary";
      case "completed": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen cyber-grid scanline">
        <div className="container mx-auto p-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold cyber-text text-primary mb-2">
                Projects
              </h1>
              <p className="text-muted-foreground">
                Manage and track all your projects
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Project description"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div>
                      <label className="text-sm font-medium">Team</label>
                      <Select
                        value={formData.teamId}
                        onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams?.map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Project Manager</label>
                    <Input
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      placeholder="Manager ID"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Project
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur hover:border-primary transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">Team:</span>
                        <span className="text-foreground">{project.teamName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-secondary" />
                        <span className="text-muted-foreground">Status:</span>
                        <span className={getStatusColor(project.status)}>{project.status}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="text-foreground">{project.progress}%</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasks</span>
                        <span className="text-foreground">
                          {project.completedTasks}/{project.totalTasks}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}