/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * 
 * Main navigation bar for the application.
 * Includes desktop and mobile navigation, user menu, and admin links.
 * 
 * To customize branding:
 * 1. Change APP_NAME in src/config/appConfig.ts
 * 2. Replace the Home icon below with your custom logo
 *    (import your logo and replace <Home className="h-6 w-6 text-primary" />)
 * 
 * To change navigation links:
 * - Edit the navLinks array below
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Home, Search, Users, MessageSquare, LogIn, UserPlus, Shield, LogOut, User, FileText, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { APP_NAME } from '@/config/appConfig';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Badge } from '@/components/ui/badge';

// ============================================
// MAIN NAVBAR COMPONENT
// ============================================

export const Navbar = () => {
  // Mobile menu state
  const [open, setOpen] = useState(false);
  
  // User and auth state
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Unread messages count for notification badge
  const { unreadCount } = useUnreadMessages();
  
  const navigate = useNavigate();

  // ========================================
  // AUTH STATE LISTENER
  // ========================================
  useEffect(() => {
    // Helper to fetch additional user data (deferred to prevent deadlock)
    const fetchUserData = async (userId: string) => {
      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!roleData);

      // Fetch user profile for display name and role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(profileData);
      setIsLandlord(profileData?.role === 'landlord');
      setIsStudent(profileData?.role === 'student');
    };

    // Set up auth listener FIRST with synchronous callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLandlord(false);
          setIsStudent(false);
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ========================================
  // SIGN OUT HANDLER
  // ========================================
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ========================================
  // NAVIGATION LINKS CONFIGURATION
  // ========================================
  // Edit this array to add/remove/change navigation links
  const navLinks = [
    { href: '/listings', label: 'Find Housing', icon: Search },
    { href: '/roommates', label: 'Find Roommates', icon: Users },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  // Get user initials for avatar fallback
  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* ================================
            LOGO AND APP NAME
            ================================
            To change the logo:
            1. Import your logo: import Logo from '@/assets/your-logo.svg'
            2. Replace <Home className="h-6 w-6 text-primary" /> with <Logo className="h-6 w-6" />
            
            To change the app name:
            Edit APP_NAME in src/config/appConfig.ts
        */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt={APP_NAME} className="h-8 w-8 object-contain" />
          <span className="font-bold text-xl text-foreground">{APP_NAME}</span>
        </Link>

        {/* ================================
            DESKTOP NAVIGATION
            ================================ */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Main navigation links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
              {/* Notification badge for Messages */}
              {link.href === '/messages' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-4 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          ))}
          
          {/* Landlord applications link */}
          {isLandlord && (
            <Link
              to="/applications"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Applications
            </Link>
          )}
          
          {/* Student applications link */}
          {isStudent && (
            <Link
              to="/my-applications"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ClipboardList className="h-4 w-4" />
              My Applications
            </Link>
          )}
          
          {/* Admin link - only shown for admin users */}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* ================================
            DESKTOP USER MENU
            ================================ */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            // Logged in: Show user dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/messages')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                {isLandlord && (
                  <DropdownMenuItem onClick={() => navigate('/applications')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Applications
                  </DropdownMenuItem>
                )}
                {isStudent && (
                  <DropdownMenuItem onClick={() => navigate('/my-applications')}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    My Applications
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not logged in: Show sign in/up buttons
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?tab=signup')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* ================================
            MOBILE NAVIGATION
            ================================ */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-4 mt-8">
              {/* Mobile nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="relative flex items-center gap-3 text-lg font-medium p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                  {/* Notification badge for Messages on mobile */}
                  {link.href === '/messages' && unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 min-w-5 flex items-center justify-center p-0 text-xs ml-auto"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              ))}
              
              {/* Landlord applications link for mobile */}
              {isLandlord && (
                <Link
                  to="/applications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  Applications
                </Link>
              )}
              
              {/* Student applications link for mobile */}
              {isStudent && (
                <Link
                  to="/my-applications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <ClipboardList className="h-5 w-5" />
                  My Applications
                </Link>
              )}
              
              {/* Admin link for mobile */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium p-2 rounded-md hover:bg-muted transition-colors text-primary"
                >
                  <Shield className="h-5 w-5" />
                  Admin Dashboard
                </Link>
              )}
              
              <hr className="my-2" />
              
              {/* Mobile auth buttons */}
              {user ? (
                <Button variant="outline" onClick={() => { setOpen(false); handleSignOut(); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setOpen(false); navigate('/auth'); }}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={() => { setOpen(false); navigate('/auth?tab=signup'); }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
