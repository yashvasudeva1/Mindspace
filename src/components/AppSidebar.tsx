import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Trophy, Settings, LogOut, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from './ui/sidebar';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Progress', href: '/progress', icon: Trophy },
  { name: 'Resources', href: '/resources', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { displayName, avatarEmoji, loading } = useUserProfile();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-border-soft bg-card/60 backdrop-blur-sm">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {isCollapsed ? 'M' : 'Mindspace'}
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "nav-item",
                          isActive && "active"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        {!isCollapsed && (
          <div className="wellness-card p-4 text-center mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              You're doing great! 🌱
            </p>
            <p className="text-xs text-muted-foreground">
              Remember to be kind to yourself today
            </p>
          </div>
        )}
        
        <div className="border-t border-border-soft pt-4">
          <div className={cn("flex items-center gap-3 mb-3", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
              {loading ? '⏳' : avatarEmoji}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full", isCollapsed && "px-2")}
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}