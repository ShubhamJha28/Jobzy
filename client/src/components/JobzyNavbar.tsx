import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { JobzyLogo } from './JobzyLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../api/client';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Briefcase,
  Layers,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { LiquidNavbar, NimbusIcons, LiquidNavItem } from './ui/liquid-glass-navbar';

export const JobzyNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    if (showNotifications || showUserMenu) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [showNotifications, showUserMenu]);

  // Scroll with comfortable offset for sticky navbar
  const scrollToSection = (id: string) => {
    let el = document.getElementById(id);
    if (!el && (id === 'explore-jobs' || id === 'jobs')) {
      el = document.getElementById('explore-jobs') || document.getElementById('jobs');
    }
    if (!el) return;
    const navbarOffset = 96;
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - navbarOffset;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
  };

  // Handle smooth scroll when navigating to hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const tryScroll = (attempts = 0) => {
        let el = document.getElementById(id);
        if (!el && (id === 'explore-jobs' || id === 'jobs')) {
          el = document.getElementById('explore-jobs') || document.getElementById('jobs');
        }
        if (el) {
          scrollToSection(id);
        } else if (attempts < 8) {
          setTimeout(() => tryScroll(attempts + 1), 80);
        }
      };
      tryScroll();
    }
  }, [location.pathname, location.hash]);

  const publicNavItems: LiquidNavItem[] = [
    { label: 'Features', href: '/#features', icon: NimbusIcons.globe, fx: 'spin' },
    { label: 'How It Works', href: '/#how-it-works', icon: NimbusIcons.plane, fx: 'plane' },
    { label: 'Pricing', href: '/#pricing', icon: NimbusIcons.drop, fx: 'drop' },
    { label: 'Explore Jobs', href: '/#explore-jobs', icon: NimbusIcons.home, fx: 'glow' },
  ];

  const candidateNavItems: LiquidNavItem[] = [
    { label: 'Dashboard', href: '/candidate/dashboard', icon: NimbusIcons.home, fx: 'glow' },
    { label: 'Jobs', href: '/candidate/jobs', icon: NimbusIcons.globe, fx: 'spin' },
    { label: 'Resumes', href: '/candidate/resumes', icon: NimbusIcons.plane, fx: 'plane' },
    { label: 'Applications', href: '/candidate/applications', icon: NimbusIcons.drop, fx: 'drop' },
  ];

  const recruiterNavItems: LiquidNavItem[] = [
    { label: 'Dashboard', href: '/recruiter/dashboard', icon: NimbusIcons.home, fx: 'glow' },
    { label: 'Jobs', href: '/recruiter/jobs', icon: NimbusIcons.globe, fx: 'spin' },
    { label: 'Screening', href: '/recruiter/bulk-screening', icon: NimbusIcons.plane, fx: 'plane' },
    { label: 'Interviews', href: '/recruiter/interviews', icon: NimbusIcons.drop, fx: 'drop' },
  ];

  const adminNavItems: LiquidNavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: NimbusIcons.home, fx: 'glow' },
    { label: 'Users', href: '/admin/users', icon: NimbusIcons.user, fx: 'wave' },
    { label: 'Audit Logs', href: '/admin/logs', icon: NimbusIcons.drop, fx: 'drop' },
  ];

  const activeNavItems = !user
    ? publicNavItems
    : user.role === 'CANDIDATE'
    ? candidateNavItems
    : user.role === 'RECRUITER'
    ? recruiterNavItems
    : adminNavItems;

  const getActiveIndex = () => {
    if (!user) {
      if (location.pathname === '/pricing') return 2;
      if (location.pathname === '/') {
        if (location.hash === '#explore-jobs' || location.hash === '#jobs') return 3;
        if (location.hash === '#pricing') return 2;
        if (location.hash === '#how-it-works') return 1;
        if (location.hash === '#features') return 0;
        return 0;
      }
      if (location.pathname.startsWith('/candidate/jobs')) return 3;
      return 0;
    }
    if (user.role === 'CANDIDATE') {
      if (location.pathname.includes('/jobs')) return 1;
      if (location.pathname.includes('/resume') || location.pathname.includes('/builder') || location.pathname.includes('/optimizer')) return 2;
      if (location.pathname.includes('/applications')) return 3;
      return 0;
    }
    if (user.role === 'RECRUITER') {
      if (location.pathname.includes('/jobs')) return 1;
      if (location.pathname.includes('/screening') || location.pathname.includes('/ranking') || location.pathname.includes('/shortlists')) return 2;
      if (location.pathname.includes('/interviews')) return 3;
      return 0;
    }
    if (user.role === 'ADMIN') {
      if (location.pathname.includes('/users')) return 1;
      if (location.pathname.includes('/logs')) return 2;
      return 0;
    }
    return 0;
  };

  const [activeIdx, setActiveIdx] = useState<number>(() => getActiveIndex());

  // Keep activeIdx in sync with route / hash changes
  useEffect(() => {
    setActiveIdx(getActiveIndex());
  }, [location.pathname, location.hash, user]);

  // Scrollspy on landing page to keep active tab highlighted during scroll
  useEffect(() => {
    if (user || location.pathname !== '/') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      const featuresEl = document.getElementById('features');
      const howItWorksEl = document.getElementById('how-it-works');
      const pricingEl = document.getElementById('pricing');
      const exploreJobsEl = document.getElementById('explore-jobs') || document.getElementById('jobs');

      if (exploreJobsEl && scrollPos >= exploreJobsEl.offsetTop) {
        setActiveIdx(3);
      } else if (pricingEl && scrollPos >= pricingEl.offsetTop) {
        setActiveIdx(2);
      } else if (howItWorksEl && scrollPos >= howItWorksEl.offsetTop) {
        setActiveIdx(1);
      } else if (featuresEl && scrollPos >= featuresEl.offsetTop) {
        setActiveIdx(0);
      } else if (window.scrollY < 300) {
        setActiveIdx(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, location.pathname]);

  const handleNavChange = (index: number) => {
    setActiveIdx(index);
    if (!user) {
      const targets = [
        { path: '/#features', id: 'features' },
        { path: '/#how-it-works', id: 'how-it-works' },
        { path: '/#pricing', id: 'pricing' },
        { path: '/#explore-jobs', id: 'explore-jobs' },
      ];
      const target = targets[index];
      if (!target) return;

      if (target.id) {
        if (location.pathname !== '/') {
          navigate(target.path);
        } else {
          navigate(`/#${target.id}`);
          scrollToSection(target.id);
        }
      } else {
        navigate(target.path);
      }
    } else if (user.role === 'CANDIDATE') {
      const paths = ['/candidate/dashboard', '/candidate/jobs', '/candidate/resumes', '/candidate/applications'];
      if (paths[index]) navigate(paths[index]);
    } else if (user.role === 'RECRUITER') {
      const paths = ['/recruiter/dashboard', '/recruiter/jobs', '/recruiter/bulk-screening', '/recruiter/interviews'];
      if (paths[index]) navigate(paths[index]);
    } else if (user.role === 'ADMIN') {
      const paths = ['/admin/dashboard', '/admin/users', '/admin/logs'];
      if (paths[index]) navigate(paths[index]);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await apiRequest<{ success: boolean; unreadCount: number; notifications: any[] }>('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/all/read', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full pt-3 pb-2 px-3 sm:px-6 lg:px-8 transition-colors duration-250 ${
      isDark ? 'bg-black/40 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md border-b border-black/[0.04]'
    }`}>
      <div className="max-w-7xl mx-auto">
        <LiquidNavbar
          items={activeNavItems}
          tone={isDark ? 'dark' : 'light'}
          active={activeIdx}
          onChange={handleNavChange}
          sound={false}
          leftContent={
            <div className="flex items-center pl-1">
              <JobzyLogo size="md" withTagline={!user} to="/" />
            </div>
          }
          rightContent={
            <div className="flex items-center gap-2 sm:gap-3 pr-1" onClick={(e) => e.stopPropagation()}>
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer relative z-20 ${
                  isDark
                    ? 'text-[#A3A3A3] hover:text-[#C4F167] hover:bg-[#161616]/60 border-transparent hover:border-[#C4F167]/30'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5 border-transparent hover:border-black/10'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-[#C4F167]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0F172A]" />
                )}
              </button>

              {!user ? (
                <div className="flex items-center gap-2 relative z-20">
                  <Link
                    to="/login"
                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer rounded-lg inline-flex items-center justify-center ${
                      isDark
                        ? 'text-[#D1D1D1] hover:text-white hover:bg-white/5'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-bold text-black bg-[#C4F167] hover:bg-[#b0df52] hover:shadow-[0_0_18px_rgba(196,241,103,0.45)] transition-all rounded-full cursor-pointer inline-flex items-center justify-center shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative z-20">
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                        isDark
                          ? 'text-[#A3A3A3] hover:text-white hover:bg-[#161616] border-transparent hover:border-[#2a2a2a]'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5 border-transparent hover:border-black/10'
                      }`}
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C4F167] animate-pulse" />
                      )}
                    </button>

                    {showNotifications && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150 border ${
                          isDark
                            ? 'bg-[#111111] border-[#2a2a2a] text-white'
                            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                        }`}
                      >
                        <div className={`flex items-center justify-between pb-3 border-b ${
                          isDark ? 'border-[#222222]' : 'border-slate-100'
                        }`}>
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Notifications ({unreadCount})
                          </span>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllRead}
                              className="text-[11px] text-[#84CC16] dark:text-[#C4F167] hover:underline cursor-pointer font-semibold"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-[#777777] text-center py-4">No notifications yet.</p>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                className={`p-2.5 rounded-xl text-xs border ${
                                  !n.readAt
                                    ? isDark
                                      ? 'bg-[#181818] border-[#C4F167]/30 text-white'
                                      : 'bg-lime-50/80 border-lime-300 text-slate-900'
                                    : isDark
                                    ? 'bg-transparent border-[#222222] text-[#A3A3A3]'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <p className="font-semibold">{n.title}</p>
                                <p className="text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserMenu(!showUserMenu);
                        setShowNotifications(false);
                      }}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#141414] border-[#242424] hover:border-[#383838]'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                      aria-label="User Menu"
                    >
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
                        {user.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
                    </button>

                    {showUserMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150 border ${
                          isDark
                            ? 'bg-[#111111] border-[#2a2a2a] text-white'
                            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                        }`}
                      >
                        <div className={`px-3 py-2 border-b ${isDark ? 'border-[#222222]' : 'border-slate-100'}`}>
                          <p className="text-xs font-bold truncate">{user.name}</p>
                          <p className="text-[11px] text-[#A3A3A3] truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#000000] bg-[#C4F167] px-2 py-0.5 rounded-md uppercase">
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          {user.role === 'CANDIDATE' && (
                            <Link
                              to="/candidate/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                                isDark
                                  ? 'text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a]'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <Briefcase className="w-3.5 h-3.5 text-[#84CC16] dark:text-[#C4F167]" />
                              Candidate Dashboard
                            </Link>
                          )}
                          {user.role === 'RECRUITER' && (
                            <Link
                              to="/recruiter/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                                isDark
                                  ? 'text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a]'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5 text-[#84CC16] dark:text-[#C4F167]" />
                              Recruiter Dashboard
                            </Link>
                          )}
                          {user.role === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                                isDark
                                  ? 'text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a]'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16] dark:text-[#C4F167]" />
                              Admin Console
                            </Link>
                          )}
                        </div>

                        <div className={`pt-1 border-t ${isDark ? 'border-[#222222]' : 'border-slate-100'}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile menu toggle button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className={`md:hidden p-2 cursor-pointer relative z-20 ${
                  isDark ? 'text-[#A3A3A3] hover:text-white' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#84CC16] dark:text-[#C4F167]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          }
        />

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-2 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 relative z-50 border ${
            isDark
              ? 'bg-[#111111]/95 border-[#C4F167]/30 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex flex-col gap-2">
              {activeNavItems.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    handleNavChange(idx);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                    idx === getActiveIndex()
                      ? 'bg-[#C4F167]/20 text-[#3F6212] dark:text-[#C4F167] font-semibold'
                      : isDark
                      ? 'text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[#84CC16] dark:text-[#C4F167]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
