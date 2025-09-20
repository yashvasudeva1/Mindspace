import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Trophy, Settings, Menu, X, LogOut, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SidebarProvider, SidebarTrigger, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Progress', href: '/progress', icon: Trophy },
  { name: 'Resources', href: '/resources', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { displayName, avatarEmoji, loading } = useUserProfile();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-background-subtle w-full">
        {/* Mobile header */}
        <header className="lg:hidden bg-card/80 backdrop-blur-sm border-b border-border-soft sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-2xl font-bold">Mindspace</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Mobile navigation menu */}
          {mobileMenuOpen && (
            <nav className="border-t border-border-soft bg-card p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "nav-item",
                        isActive && "active"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </nav>
          )}
        </header>

        <div className="flex w-full">
          {/* Desktop sidebar with collapse functionality */}
          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          {/* Main content */}
          <SidebarInset className="flex-1 w-full">
            {/* Desktop header with sidebar toggle */}
            <header className="hidden lg:flex h-16 items-center gap-2 px-6 border-b border-border-soft bg-card/60 backdrop-blur-sm sticky top-0 z-40">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border-soft" />
              <h2 className="font-semibold text-foreground">Mindspace</h2>
            </header>
            
            <main className="flex-1">
              <div className="min-h-screen">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}