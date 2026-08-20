import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, Search, ChevronDown, LogOut, User, Settings,
  Home, FolderOpen, FileCheck, FileText, ClipboardList, CheckSquare, Award,
  Briefcase, BarChart3, Users, UserCog, Shield, MessageSquare,
  Building2, ChevronLeft, ChevronRight,
  TrendingUp, Star, Flag, Lock, AlertTriangle, Bookmark, Rocket, Megaphone, Compass
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess, type CompanyAccessValue } from '@/contexts/CompanyAccessContext';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import type { UserRole } from '@/lib/database.types';
import type { CompanyTabKey } from '@/services/companyTeam';
import { supabase } from '@/lib/supabase';
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from '@/services/notifications';
import { updateMyProfile } from '@/services/users';
import LoginWelcomeModal from '@/components/onboarding/LoginWelcomeModal';
import ThemeToggle from '@/components/ThemeToggle';
import { TourProvider, useTour } from '@/components/onboarding/tour/TourProvider';
import { TourSpotlight } from '@/components/onboarding/tour/TourSpotlight';
import { useSidebarCounts } from '@/hooks/useSidebarCounts';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Count shown in the sidebar pill, keyed into the live useSidebarCounts data. */
  badgeKey?: 'applications' | 'tasks' | 'messages';
  children?: { label: string; href: string }[];
  /** data-tour anchor used by the onboarding tour to highlight this nav item. */
  tourTarget?: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: Home, tourTarget: 'nav-dashboard' },
    { label: 'Workspace', href: '/student/workspace', icon: Briefcase, tourTarget: 'nav-workspace' },
    { label: 'Internships', href: '/student/internships', icon: FolderOpen, tourTarget: 'nav-internships' },
    { label: 'Saved', href: '/student/saved', icon: Bookmark },
    { label: 'Applications', href: '/student/applications', icon: FileCheck, tourTarget: 'nav-applications', badgeKey: 'applications' },
    { label: 'Team Applications', href: '/student/team-applications', icon: Rocket },
    { label: 'Tasks', href: '/student/tasks', icon: ClipboardList, tourTarget: 'nav-tasks', badgeKey: 'tasks' },
    { label: 'Progress', href: '/student/progress', icon: TrendingUp, tourTarget: 'nav-progress' },
    { label: 'Messages', href: '/student/messages', icon: MessageSquare, badgeKey: 'messages' },
    { label: 'Certificates', href: '/student/certificates', icon: Award, tourTarget: 'nav-certificates' },
    { label: 'Offer Letters', href: '/student/offer-letters', icon: FileText },
    { label: 'Portfolio', href: '/student/portfolio', icon: User },
    { label: 'Profile', href: '/student/profile', icon: UserCog },
  ],
  company: [
    { label: 'Dashboard', href: '/company/dashboard', icon: Home },
    { label: 'Profile', href: '/company/profile', icon: Building2 },
    { label: 'Internships', href: '/company/internships', icon: FolderOpen, children: [
      { label: 'All Internships', href: '/company/internships' },
      { label: 'Post New', href: '/company/internships/new' },
    ]},
    { label: 'Applications', href: '/company/applications', icon: FileCheck, badgeKey: 'applications' },
    { label: 'Interns', href: '/company/interns', icon: Users },
    { label: 'Tasks', href: '/company/tasks', icon: ClipboardList },
    { label: 'Messages', href: '/company/messages', icon: MessageSquare },
    { label: 'Analytics', href: '/company/analytics', icon: BarChart3 },
    { label: 'Certificates', href: '/company/certificates', icon: Award },
    { label: 'Offer Letters', href: '/company/offer-letters', icon: FileText },
    { label: 'Team', href: '/company/team', icon: UserCog },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor/dashboard', icon: Home },
    { label: 'My Interns', href: '/mentor/interns', icon: Users },
    { label: 'Tasks', href: '/mentor/tasks', icon: ClipboardList, badgeKey: 'tasks' },
    { label: 'Evaluations', href: '/mentor/evaluations', icon: CheckSquare },
    { label: 'Messages', href: '/mentor/messages', icon: MessageSquare },
    { label: 'Profile', href: '/mentor/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Companies', href: '/admin/companies', icon: Building2 },
    { label: 'Internships', href: '/admin/internships', icon: FolderOpen },
    { label: 'Certificates', href: '/admin/certificates', icon: Award },
    { label: 'Offer Letters', href: '/admin/offer-letters', icon: FileText },
    { label: 'Applications', href: '/admin/applications', icon: FileCheck },
    { label: 'Team Applications', href: '/admin/team-applications', icon: Rocket },
    { label: 'Site Banners', href: '/admin/site-banners', icon: Megaphone },
    { label: 'Inbox', href: '/admin/inbox', icon: MessageSquare },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', href: '/admin/reports', icon: Flag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Logs', href: '/admin/logs', icon: Shield },
  ],
};

const RESTRICTED_ROUTES: Record<string, string[]> = {
  student: ['/student/workspace', '/student/certificates'],
  company: ['/company/internships/new', '/company/applications', '/company/team', '/company/certificates'],
  mentor: ['/mentor/tasks', '/mentor/evaluations']
};

/** Map a nav href to its company tab key (path segment after /company/). */
function companyTabKeyFromHref(href: string): CompanyTabKey {
  const segment = href.replace(/^\//, '').split('/')[1] as CompanyTabKey;
  return segment || 'dashboard';
}

/**
 * For the company portal only: filter the static nav to the tabs the
 * current member's role is allowed to see. Other roles pass through.
 *
 * Filtering only applies once access has RESOLVED and the user has a
 * company; while loading (or when resolution is empty) the full nav is
 * shown instead of an empty sidebar — route-level TabGate + RLS still
 * enforce the matrix.
 */
function useCompanyNavItems(role: UserRole, access: CompanyAccessValue | undefined): NavItem[] {
  return useMemo(() => {
    const items = navConfig[role] || [];
    if (role !== 'company' || !access) return items;
    if (access.loading || !access.hasAccess || (!access.isOwner && !access.memberRole)) return items;

    const filtered = items
      .filter((item) => access.canAccessTab(companyTabKeyFromHref(item.href)))
      .map((item) => {
        if (!item.children) return item;
        const children = item.children.filter((child) =>
          access.canAccessTab(companyTabKeyFromHref(child.href))
        );
        return children.length ? { ...item, children } : item;
      });

    return filtered.length > 0 ? filtered : items;
  }, [role, access]);
}

const ROLE_SPECIFIC_ITEMS: Record<string, string[]> = {
  student: ['Resume', 'Skills', 'Education', 'Basic profile'],
  company: ['Company details', 'Logo', 'Organization information'],
  mentor: ['Professional experience', 'Skills', 'Profile information']
};

export default function DashboardLayout({ role }: { role: UserRole }) {
  const { user, signOut, profile, profileCompleted, profileCompletionPercentage, profileCompletionRequirements } = useAuth();
  const companyAccess = useOptionalCompanyAccess();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useCompanyNavItems(role, companyAccess);
  const sidebarCounts = useSidebarCounts(role === 'company' ? companyAccess?.company?.id ?? null : null);

  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourSignal, setTourSignal] = useState<string | null>(null);
  const welcomeShown = useRef(false);

  const handleTourEnd = useCallback((tourId: string, _completed: boolean) => {
    if (!profile) return;
    const existing = profile.onboarding_tours ?? [];
    if (existing.includes(tourId)) return;
    updateMyProfile({ onboarding_tours: [...existing, tourId] }).catch((err) =>
      console.error('Failed to persist onboarding tour:', err)
    );
  }, [profile]);

  const handleStartTour = () => {
    handleCloseWelcome();
    setTourSignal('student-journey');
  };

  useEffect(() => {
    if (profile && !profileCompleted && profile.role !== 'admin' && profile.role === role) {
      const dismissed = sessionStorage.getItem('profile_modal_dismissed_session');
      if (!dismissed && !welcomeShown.current && !sessionStorage.getItem('login_welcome_dismissed_session')) {
        setShowModal(true);
      }
    }
  }, [profile, profileCompleted, showWelcome, role]);

  useEffect(() => {
    if (profile && profile.role === 'student' && !profileCompleted && role === 'student') {
      const dismissed = sessionStorage.getItem('login_welcome_dismissed_session');
      if (!dismissed && !welcomeShown.current) {
        welcomeShown.current = true;
        setShowWelcome(true);
      }
    }
  }, [profile, profileCompleted, role]);

  useEffect(() => {
    if (showWelcome) setShowModal(false);
  }, [showWelcome]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const handleCloseWelcome = () => {
    sessionStorage.setItem('login_welcome_dismissed_session', 'true');
    setShowWelcome(false);
  };

  const handleWelcomeAction = (path: string) => {
    handleCloseWelcome();
    navigate(path);
  };

  const handleCloseModal = () => {
    sessionStorage.setItem('profile_modal_dismissed_session', 'true');
    setShowModal(false);
  };

  const handleCompleteProfile = () => {
    handleCloseModal();
    navigate('/complete-profile');
  };

  useEffect(() => {
    if (profile && !profileCompleted && profile.role !== 'admin' && profile.role === role) {
      const restricted = RESTRICTED_ROUTES[profile.role] || [];
      const isRestricted = restricted.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
      );
      if (isRestricted) {
        navigate(`/${profile.role}/dashboard`);
        toast.error("Please complete your profile before using this feature.");
      }
    }
  }, [location.pathname, profile, profileCompleted, navigate, role]);

  const getRequirementStatus = (reqName: string) => {
    if (!profile) return false;
    const missing = profileCompletionRequirements || [];
    
    if (profile.role === 'student') {
      if (reqName === 'Basic profile') {
        return !missing.some(m => m.startsWith('Basic profile'));
      }
      if (reqName === 'Education') {
        return !missing.some(m => m.startsWith('Education'));
      }
      if (reqName === 'Skills') {
        return !missing.includes('Skills');
      }
      if (reqName === 'Resume') {
        return !missing.includes('Resume');
      }
    }
    
    if (profile.role === 'company') {
      if (reqName === 'Company details') {
        return !missing.some(m => m.startsWith('Company details'));
      }
      if (reqName === 'Logo') {
        return !missing.some(m => m.includes('Logo'));
      }
      if (reqName === 'Organization information') {
        return !missing.some(m => m.startsWith('Organization information'));
      }
    }
    
    if (profile.role === 'mentor') {
      if (reqName === 'Professional experience') {
        return !missing.some(m => m.startsWith('Professional experience'));
      }
      if (reqName === 'Skills') {
        return !missing.includes('Skills');
      }
      if (reqName === 'Profile information') {
        return !missing.some(m => m.startsWith('Basic profile') || m.startsWith('Profile information'));
      }
    }
    
    return false;
  };
  useEffect(() => {
    if (!user) return;

    async function loadNotifications(useCache = true) {
      try {
        const [notifs, count] = await Promise.all([
          getNotifications(5, useCache),
          getUnreadNotificationCount(useCache)
        ]);
        const dbNotifs = notifs?.data || [];
        if (dbNotifs.length === 0) {
          setNotifications([
            {
              id: 'mock-1',
              title: 'Welcome to ZYR0!',
              message: 'Your career accelerator is now ready. Start by exploring internships in the Portal.',
              read: false,
              created_at: new Date().toISOString(),
              action_url: `/${role}/internships`
            },
            {
              id: 'mock-2',
              title: 'Complete Profile',
              message: 'Optimize your portfolio profile to attract company recruiter lookups.',
              read: true,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              action_url: `/${role}/profile`
            }
          ]);
          setUnreadCount(1);
        } else {
          setNotifications(dbNotifs);
          setUnreadCount(count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }

    loadNotifications();

    // Subscribe to realtime Postgres changes for notifications table
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Bypass cache when a real-time event triggers to fetch the latest state
          loadNotifications(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);
  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <TourProvider onTourEnd={handleTourEnd}>
      <DashboardOnboarding startTourSignal={tourSignal} onTourConsumed={() => setTourSignal(null)} />
      <div className="min-h-screen bg-background flex">
        <SEO title="Dashboard" description="ZYR0 Platform dashboard and user portal." noIndex={true} />
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col transition-all duration-300 ${sidebarWidth} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <Link to={`/${role}/dashboard`} className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/zyro-logo.webp" alt="ZYR0 Logo" width="32" height="32" className="w-8 h-8 object-contain rounded-md" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold whitespace-nowrap"
              >
                ZYR0
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => { setMobileOpen(false); setCollapsed(!collapsed); }}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="lg:hidden inline-flex items-center justify-center min-w-11 min-h-11 rounded-md hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav data-tour="sidebar-nav" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.label);
            
            const isItemRestricted = profile && !profileCompleted && profile.role !== 'admin' && (
              (RESTRICTED_ROUTES[profile.role] || []).some(route => item.href === route || item.href.startsWith(route + '/'))
            );

            return (
              <div key={item.href}>
                <Link
                  to={item.href}
                  data-tour={item.tourTarget}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleSection(item.label);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${isItemRestricted ? 'opacity-75' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap">{item.label}</span>
                      {item.badgeKey && sidebarCounts[item.badgeKey] && !isItemRestricted && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                          {sidebarCounts[item.badgeKey]}
                        </span>
                      )}
                      {isItemRestricted && (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      {hasChildren && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </>
                  )}
                  {collapsed && item.badgeKey && sidebarCounts[item.badgeKey] && !isItemRestricted && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                  )}
                  {collapsed && isItemRestricted && (
                    <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/60 animate-pulse" />
                  )}
                </Link>
                {/* Submenu */}
                {!collapsed && hasChildren && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3"
                  >
                    {item.children?.map((child) => {
                      const isChildRestricted = profile && !profileCompleted && profile.role !== 'admin' && (
                        (RESTRICTED_ROUTES[profile.role] || []).some(route => child.href === route || child.href.startsWith(route + '/'))
                      );
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            location.pathname === child.href
                              ? 'text-accent font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          } ${isChildRestricted ? 'opacity-85 font-normal' : ''}`}
                        >
                          <span className="truncate">{child.label}</span>
                          {isChildRestricted && <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0 ml-1" />}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 space-y-1 flex-shrink-0">
          {/* Workspace switcher — shown in the mobile drawer (desktop keeps the header avatar menu) */}
          {companyAccess?.hasAccess && role !== 'company' && (
            <Link
              to="/company/dashboard"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span>Switch to {companyAccess.company?.name || 'Company'} Workspace</span>
            </Link>
          )}
          {role === 'company' && profile?.role && profile.role !== 'company' && (
            <Link
              to={`/${profile.role}/dashboard`}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span>Switch to {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Workspace</span>
            </Link>
          )}
          <Link
            to={`/${role}/settings`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.includes('/settings')
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb could go here */}
          </div>

          <div className="flex items-center gap-3">
            <span data-tour="header-theme-toggle">
              <ThemeToggle />
            </span>
            <TourHelpButton />
            <button className="relative inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                data-tour="header-notifications"
                className="relative inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-card rounded-xl border border-border shadow-lg py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
                      <p className="text-sm font-semibold">Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllNotificationsRead();
                            setUnreadCount(0);
                            const updated = notifications.map(n => ({ ...n, read: true }));
                            setNotifications(updated);
                          }}
                          className="text-[11px] text-accent hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={async () => {
                              if (!notif.read && !notif.id.startsWith('mock-')) {
                                await markNotificationRead(notif.id);
                              }
                              setUnreadCount(prev => Math.max(0, prev - 1));
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                              setNotificationsOpen(false);
                              if (notif.action_url) navigate(notif.action_url);
                            }}
                            className={`w-full p-3 text-left transition-colors cursor-pointer hover:bg-muted/40 block ${
                              !notif.read ? 'bg-accent/5' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-xs font-semibold ${!notif.read ? 'text-accent' : 'text-foreground'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[9px] text-muted-foreground/60 mt-1">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <img src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="hidden sm:block text-sm font-medium">{user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role} Account</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setProfileOpen(false); navigate(`/${role}/profile`); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button onClick={() => { setProfileOpen(false); navigate(`/${role}/settings`); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      {companyAccess?.hasAccess && role !== 'company' && (
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/company/dashboard'); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-accent/10 font-medium transition-colors border-t border-border mt-1 pt-2"
                        >
                          <Building2 className="w-4 h-4 text-accent" /> Switch to {companyAccess.company?.name || 'Company'} Workspace
                        </button>
                      )}
                      {role === 'company' && profile?.role && profile.role !== 'company' && (
                        <button
                          onClick={() => { setProfileOpen(false); navigate(`/${profile.role}/dashboard`); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-accent/10 font-medium transition-colors border-t border-border mt-1 pt-2"
                        >
                          <User className="w-4 h-4 text-accent" /> Switch to {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Workspace
                        </button>
                      )}
                    </div>
                    <div className="border-t border-border pt-1">
                      <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Banner */}
        {profile && !profileCompleted && profile.role !== 'admin' && !bannerDismissed && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-800 dark:text-amber-300 flex items-center justify-between gap-4 shrink-0 transition-all duration-300">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate">
                  Complete your profile to unlock all platform features.
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-28 h-1.5 bg-amber-500/25 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500" 
                      style={{ width: `${profileCompletionPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold shrink-0">
                    {profileCompletionPercentage}% complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to="/complete-profile" 
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shadow-sm shadow-amber-500/10 cursor-pointer"
              >
                Complete Now
              </Link>
              <button 
                onClick={() => setBannerDismissed(true)} 
                aria-label="Dismiss banner"
                className="inline-flex items-center justify-center min-w-9 min-h-9 rounded-md hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center z-10"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                To ensure trust and maintain the quality of the ZYR0 community, you must complete your profile before accessing platform features.
              </p>
              
              {/* Checklist */}
              {profile && (
                <div className="mt-6 text-left bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Items</p>
                  <ul className="space-y-2.5">
                    {(ROLE_SPECIFIC_ITEMS[profile.role] || []).map((item) => {
                      const completed = getRequirementStatus(item);
                      return (
                        <li key={item} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            completed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                              : 'bg-muted border-border text-muted-foreground'
                          }`}>
                            {completed ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                            )}
                          </div>
                          <span className={`text-sm ${completed ? 'text-muted-foreground line-through font-normal' : 'text-foreground font-medium'}`}>
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Completion Progress</span>
                      <span className="text-accent">{profileCompletionPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500 ease-out" 
                        style={{ width: `${profileCompletionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
                >
                  Later
                </button>
                <button
                  onClick={handleCompleteProfile}
                  className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-accent/10 flex items-center justify-center gap-1"
                >
                  Complete Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LoginWelcomeModal
        open={showWelcome}
        role={profile?.role ?? 'student'}
        firstName={user?.user_metadata?.full_name?.split(' ')[0]}
        onAction={handleWelcomeAction}
        onStartTour={handleStartTour}
        onDismiss={handleCloseWelcome}
      />

      <TourSpotlight />
      </div>
    </TourProvider>
  );
}

// ── Onboarding tour wiring ─────────────────────────────────────────────────────

function DashboardOnboarding({ startTourSignal, onTourConsumed }: {
  startTourSignal: string | null;
  onTourConsumed: () => void;
}) {
  const { profile, profileCompleted } = useAuth();
  const { start } = useTour();
  const autoTriggered = useRef(false);
  const pending = useRef<string | null>(null);
  const [pendingVersion, setPendingVersion] = useState(0);

  const setPending = (tourId: string) => {
    pending.current = tourId;
    setPendingVersion((v) => v + 1);
  };

  useEffect(() => {
    if (!startTourSignal) return;
    onTourConsumed();
    setPending(startTourSignal);
  }, [startTourSignal, onTourConsumed]);

  useEffect(() => {
    if (!pending.current) return;
    const tourId = pending.current;
    pending.current = null;
    // The journey tour targets sidebar nav items, which exist on every
    // dashboard page, so it can start in place without navigation.
    const timer = setTimeout(() => start(tourId), 400);
    return () => clearTimeout(timer);
  }, [pendingVersion, start]);

  useEffect(() => {
    if (autoTriggered.current) return;
    if (!profile || profile.role !== 'student' || !profileCompleted) return;
    // Treat both tour ids as "has seen onboarding" so students who
    // completed the earlier workspace tour are not re-onboarded.
    const seen = profile.onboarding_tours ?? [];
    if (seen.includes('student-journey') || seen.includes('student-workspace')) return;
    autoTriggered.current = true;
    setPending('student-journey');
  }, [profile, profileCompleted]);

  return null;
}

function TourHelpButton() {
  const { start } = useTour();
  return (
    <button
      onClick={() => start('student-journey')}
      title="Guided tour"
      aria-label="Start guided tour"
      className="relative inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Compass className="w-5 h-5" />
    </button>
  );
}
