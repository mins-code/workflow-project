import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2, Plus, X, User } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

export default function Profile() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateMyProfile);
  
  const [formData, setFormData] = useState({
    name: "",
    availability: 0,
  });
  
  const [skills, setSkills] = useState<Array<{ name: string; proficiency: number }>>([]);
  const [newSkillName, setNewSkillName] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        availability: user.availability || 0,
      });
      
      if (user.skills && Array.isArray(user.skills)) {
        const parsedSkills = user.skills.map((skill: any) => {
          if (typeof skill === "string") {
            try {
              return JSON.parse(skill);
            } catch {
              return { name: skill, proficiency: 0.5 };
            }
          }
          return skill;
        });
        setSkills(parsedSkills);
      }
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Loader2 className="h-8 w-8 animate-spin text-primary cyber-glow" />
      </div>
    );
  }

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      setSkills([...skills, { name: newSkillName.trim(), proficiency: 0.5 }]);
      setNewSkillName("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillProficiencyChange = (index: number, value: number[]) => {
    const updatedSkills = [...skills];
    updatedSkills[index].proficiency = value[0];
    setSkills(updatedSkills);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skillsObject = skills.reduce((acc, skill) => {
        acc[skill.name] = skill.proficiency;
        return acc;
      }, {} as Record<string, number>);

      await updateProfile({
        name: formData.name,
        availability: formData.availability,
        skills: skillsObject,
      });
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast.error(errorMessage);
      console.error("Profile update error:", error);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen cyber-grid scanline">
        <div className="container mx-auto p-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold cyber-text text-primary mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your profile information
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/50 cyber-glow bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Availability (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: Number(e.target.value) })}
                      placeholder="Enter availability percentage"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Skills</label>
                    <div className="space-y-4">
                      {skills.map((skill, index) => (
                        <div key={index} className="p-4 border border-border rounded bg-background/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-foreground">{skill.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSkill(index)}
                              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Proficiency</span>
                              <span className="text-primary font-medium">
                                {Math.round(skill.proficiency * 100)}%
                              </span>
                            </div>
                            <Slider
                              value={[skill.proficiency]}
                              onValueChange={(value) => handleSkillProficiencyChange(index, value)}
                              min={0}
                              max={1}
                              step={0.01}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="Add new skill"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          variant="outline"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
