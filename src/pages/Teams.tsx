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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Users, UserCheck, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { Id } from "@/convex/_generated/dataModel";

export default function Teams() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const teams = useQuery(api.teams.list);
  const createTeam = useMutation(api.teams.create);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    leadName: "",
    leadEmail: "",
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leadName || !formData.leadEmail) {
      toast.error("Please provide team lead name and email");
      return;
    }
    
    try {
      await createTeam({
        name: formData.name,
        description: formData.description,
        department: formData.department,
        leadName: formData.leadName,
        leadEmail: formData.leadEmail,
      });
      toast.success("Team created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        department: "",
        leadName: "",
        leadEmail: "",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create team. Please try again.";
      toast.error(errorMessage);
      console.error("Team creation error:", error);
    }
  };

  const handleDeleteTeam = async (teamId: Id<"teams">) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteTeam({ teamId });
      toast.success("Team deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete team. Please try again.";
      toast.error(errorMessage);
      console.error("Team deletion error:", error);
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
              Teams
            </h1>
            <p className="text-muted-foreground">
              Manage your teams and members
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow">
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Team description"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Team Lead Name</label>
                  <Input
                    value={formData.leadName}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    placeholder="Enter team lead name"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Team Lead Email</label>
                  <Input
                    type="email"
                    value={formData.leadEmail}
                    onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                    placeholder="Enter team lead email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Team
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team, index) => (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur hover:border-primary transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team._id);
                      }}
                      className="ml-auto h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                      title="Delete Team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {team.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-accent" />
                      <span className="text-muted-foreground">Department:</span>
                      <span className="text-foreground">{team.department}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-secondary" />
                      <span className="text-muted-foreground">Lead:</span>
                      <span className="text-foreground">{team.leadName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Members:</span>
                      <span className="text-foreground">{team.memberCount}</span>
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