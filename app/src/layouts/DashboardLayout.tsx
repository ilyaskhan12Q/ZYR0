import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, Search, ChevronDown, LogOut, User, Settings,
  Home, FolderOpen, FileCheck, ClipboardList, CheckSquare, Award,
  Briefcase, BarChart3, Users, UserCog, Shield, MessageSquare,
  Building2, ChevronLeft, ChevronRight,
  TrendingUp, Star, Flag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: { label: string; href: string }[];
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: Home },
    { label: 'Internships', href: '/student/internships', icon: FolderOpen },
    { label: 'Applications', href: '/student/applications', icon: FileCheck, badge: 4 },
    { label: 'Tasks', href: '/student/tasks', icon: ClipboardList, badge: 3 },
    { label: 'Progress', href: '/student/progress', icon: TrendingUp },
    { label: 'Messages', href: '/student/messages', icon: MessageSquare, badge: 3 },
    { label: 'Certificates', href: '/student/certificates', icon: Award },
    { label: 'Portfolio', href: '/student/portfolio', icon: Briefcase },
    { label: 'Profile', href: '/student/profile', icon: User },
  ],
  company: [
    { label: 'Dashboard', href: '/company/dashboard', icon: Home },
    { label: 'Profile', href: '/company/profile', icon: Building2 },
    { label: 'Internships', href: '/company/internships', icon: FolderOpen, children: [
      { label: 'All Internships', href: '/company/internships' },
      { label: 'Post New', href: '/company/internships/new' },
    ]},
    { label: 'Applicants', href: '/company/applicants', icon: FileCheck, badge: 12 },
    { label: 'Interns', href: '/company/interns', icon: Users },
    { label: 'Tasks', href: '/company/tasks', icon: ClipboardList },
    { label: 'Messages', href: '/company/messages', icon: MessageSquare },
    { label: 'Analytics', href: '/company/analytics', icon: BarChart3 },
    { label: 'Certificates', href: '/company/certificates', icon: Award },
    { label: 'Team', href: '/company/team', icon: UserCog },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor/dashboard', icon: Home },
    { label: 'My Interns', href: '/mentor/interns', icon: Users },
    { label: 'Tasks', href: '/mentor/tasks', icon: ClipboardList, badge: 3 },
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
    { label: 'Applications', href: '/admin/applications', icon: FileCheck },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports', href: '/admin/reports', icon: Flag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Logs', href: '/admin/logs', icon: Shield },
  ],
};

export default function DashboardLayout({ role }: { role: UserRole }) {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = navConfig[role] || [];

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="min-h-screen bg-background flex">
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
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold whitespace-nowrap"
              >
                Zyro
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => { setMobileOpen(false); setCollapsed(!collapsed); }}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.label);

            return (
              <div key={item.href}>
                <Link
                  to={item.href}
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
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap">{item.label}</span>
                      {item.badge && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
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
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === child.href
                            ? 'text-accent font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 space-y-1 flex-shrink-0">
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
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
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb could go here */}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <img src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-8 h-8 rounded-full object-cover" />
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
                    </div>
                    <div className="border-t border-border pt-1">
                      <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
