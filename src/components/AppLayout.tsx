import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FolderKanban, Users, CheckSquare } from "lucide-react";
import Navbar from "@/components/Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      title: "Teams",
      icon: Users,
      path: "/teams",
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 z-50 hover:w-auto group"
        onMouseEnter={() => {
          const sidebar = document.querySelector('[data-state]');
          if (sidebar) {
            const button = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
            if (button) button.click();
          }
        }}
      >
        <Sidebar className="border-r border-primary/50 bg-background/95 backdrop-blur">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary cyber-text text-lg px-4 py-4">
              ProDeX
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      className="cyber-glow-subtle hover:border-primary/50 transition-all"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      </div>
      <SidebarInset className="flex flex-col" onMouseEnter={() => {
        const sidebar = document.querySelector('[data-state="expanded"]');
        if (sidebar) {
          const button = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
          if (button) button.click();
        }
      }}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-primary/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="cyber-glow" />
          </div>
          <div className="flex-1">
            <Navbar />
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
