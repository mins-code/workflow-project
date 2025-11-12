import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { 
  Zap, 
  Users, 
  BarChart3, 
  Brain, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Management",
      description: "Create and manage teams with role-based access control",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Task Automation",
      description: "Intelligent task decomposition and smart assignment",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Track performance and productivity with live dashboards",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Workload Balancing",
      description: "Automatic workload distribution across team members",
    },
  ];

  return (
    <div className="min-h-screen cyber-grid scanline">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="text-6xl md:text-8xl font-bold cyber-text text-primary glitch" data-text="ProDeX">
              ProDeX
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-4xl font-bold mb-6 text-foreground"
          >
            Intelligent Workflow & Project Management
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Automate task creation, optimize workload distribution, and track productivity 
            with AI-powered project management
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow text-lg px-8"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 text-lg px-8"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary cyber-text">
            Powerful Features
          </h3>
          <p className="text-muted-foreground text-lg">
            Everything you need to manage projects intelligently
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 border border-primary/50 rounded bg-card/50 backdrop-blur cyber-glow"
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-accent cyber-text">
            Why Choose ProDeX?
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            "AI-powered task decomposition",
            "Smart workload balancing",
            "Real-time collaboration",
            "Advanced analytics dashboard",
            "Role-based access control",
            "Automated notifications",
          ].map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
              <span className="text-foreground">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center p-12 border border-primary/50 rounded-lg bg-card/50 backdrop-blur cyber-glow"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary cyber-text">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-muted-foreground text-lg mb-8">
            Join teams using ProDeX to manage projects intelligently
          </p>
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow text-lg px-8"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/50 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 ProDeX. Powered by AI. Built with precision.</p>
        </div>
      </footer>
    </div>
  );
}