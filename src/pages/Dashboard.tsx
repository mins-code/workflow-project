import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderKanban, 
  CheckSquare, 
  TrendingUp,
  AlertCircle,
  Activity
} from "lucide-react";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.analytics.getDashboardStats);
  const teamPerformance = useQuery(api.analytics.getTeamPerformance);

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

  return (
    <AppLayout>
      <div className="min-h-screen cyber-grid scanline">
        <div className="container mx-auto p-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold cyber-text text-primary mb-2">
              ProDeX Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="text-accent">{user.name || user.email}</span>
            </p>
          </motion.div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary cyber-text">
                      {stats.activeProjects}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.totalProjects} total projects
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-accent/50 cyber-glow bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                    <CheckSquare className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent cyber-text">
                      {stats.completedTasks}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.totalTasks} total tasks
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-secondary/50 cyber-glow bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Activity className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary cyber-text">
                      {stats.inProgressTasks}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active tasks
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-destructive/50 cyber-glow bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive cyber-text">
                      {stats.overdueTasks}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Needs attention
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {teamPerformance && teamPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamPerformance.map((team, index) => (
                      <motion.div
                        key={team.teamName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded bg-background/50"
                      >
                        <div>
                          <h3 className="font-semibold text-primary">{team.teamName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.totalProjects} projects • {team.totalTasks} tasks
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent cyber-text">
                            {team.completionRate}%
                          </div>
                          <p className="text-xs text-muted-foreground">completion rate</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}