import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  Briefcase, Settings,
  Twitter, Linkedin, Github
} from 'lucide-react';
import { currentUser } from '@/data/mockData';

const navLinks = [
  { label: 'Internships', href: '/internships' },
  { label: 'Companies', href: '/companies' },
  { label: 'Verify', href: '/verify' },
  { label: 'About', href: '/about' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/forgot-password') || location.pathname.startsWith('/reset-password');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-background"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}>
                Zyro
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent relative group ${
                    scrolled ? 'text-foreground' : 'text-white/90'
                  } ${location.pathname === link.href ? 'text-accent' : ''}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser ? (
                <>
                  <button className={`relative p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted text-foreground' : 'hover:bg-white/10 text-white'}`}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted' : 'hover:bg-white/10'}`}
                    >
                      <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className={`text-sm font-medium ${scrolled ? 'text-foreground' : 'text-white'}`}>
                        {currentUser.name}
                      </span>
                      <ChevronDown className={`w-4 h-4 ${scrolled ? 'text-muted-foreground' : 'text-white/70'}`} />
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
                            <p className="text-sm font-medium">{currentUser.name}</p>
                            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                          </div>
                          <div className="py-1">
                            <button onClick={() => navigate(`/${currentUser.role}/dashboard`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            <button onClick={() => navigate(`/${currentUser.role}/profile`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <User className="w-4 h-4" /> Profile
                            </button>
                            <button onClick={() => navigate(`/${currentUser.role}/settings`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <Settings className="w-4 h-4" /> Settings
                            </button>
                          </div>
                          <div className="border-t border-border pt-1">
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-sm font-medium transition-colors ${scrolled ? 'text-foreground hover:text-accent' : 'text-white hover:text-white/80'}`}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-foreground' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-border flex gap-3">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main><Outlet /></main>

      {/* Footer (hidden on auth pages) */}
      {!isAuthPage && (
        <footer className="bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold">Zyro</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  The complete internship management platform connecting students, companies, and mentors.
                </p>
                <div className="flex gap-4 mt-6">
                  {[Twitter, Linkedin, Github].map((Icon, i) => (
                    <a key={i} href="#" className="text-white/40 hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Students */}
              <div>
                <h4 className="font-semibold mb-4">For Students</h4>
                <ul className="space-y-2.5">
                  {['Browse Internships', 'My Applications', 'Tasks', 'Certificates', 'Portfolio'].map((item) => (
                    <li key={item}>
                      <Link to="#" className="text-white/60 text-sm hover:text-white transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Companies */}
              <div>
                <h4 className="font-semibold mb-4">For Companies</h4>
                <ul className="space-y-2.5">
                  {['Post Internship', 'Dashboard', 'Analytics', 'Team Management'].map((item) => (
                    <li key={item}>
                      <Link to="#" className="text-white/60 text-sm hover:text-white transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2.5">
                  {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                    <li key={item}>
                      <Link to="#" className="text-white/60 text-sm hover:text-white transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-white/40 text-sm">2025 Zyro. All rights reserved.</p>
              <p className="text-white/40 text-sm">Made with care for the next generation of professionals.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
