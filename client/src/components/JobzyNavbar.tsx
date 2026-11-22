import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { JobzyLogo } from './JobzyLogo';
import { JobzyButton } from './JobzyButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../api/client';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Briefcase,
  Layers,
  ChevronDown,
  ShieldCheck,
  Check,
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

  const publicNavItems: LiquidNavItem[] = [
    { label: 'Features', icon: NimbusIcons.globe, fx: 'spin' },
    { label: 'How It Works', icon: NimbusIcons.plane, fx: 'plane' },
    { label: 'Pricing', icon: NimbusIcons.drop, fx: 'drop' },
    { label: 'Explore Jobs', icon: NimbusIcons.home, fx: 'glow' },
  ];

  const getActiveIndex = () => {
    if (location.pathname === '/pricing') return 2;
    if (location.pathname.startsWith('/candidate/jobs')) return 3;
    if (location.pathname === '/' && location.hash === '#how-it-works') return 1;
    if (location.pathname === '/' && (location.hash === '#features' || location.hash === '')) return 0;
    return 0;
  };

  const handleNavChange = (index: number) => {
    const targets = [
      { path: '/#features', id: 'features' },
      { path: '/#how-it-works', id: 'how-it-works' },
      { path: '/pricing' },
      { path: '/candidate/jobs' },
    ];
    const target = targets[index];
    if (!target) return;
    if (target.id) {
      if (location.pathname !== '/') {
        navigate(target.path);
      } else {
        const el = document.getElementById(target.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate(target.path);
        }
      }
    } else {
      navigate(target.path);
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

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/90 backdrop-blur-md border-b border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-1.5 flex items-center justify-between">
        {/* Logo */}
        <JobzyLogo size="md" withTagline={!user} />

        {/* Public Nav links rendered with Liquid Glass Waterline */}
        {!user && (
          <div className="hidden md:flex items-center">
            <LiquidNavbar
              items={publicNavItems}
              tone={theme === 'dark' ? 'dark' : 'light'}
              active={getActiveIndex()}
              onChange={handleNavChange}
              sound={false}
            />
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#161616] border border-transparent hover:border-[#2a2a2a] transition-all cursor-pointer"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {!user ? (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <JobzyButton variant="ghost" size="sm">
                  Sign In
                </JobzyButton>
              </Link>
              <Link to="/register">
                <JobzyButton variant="primary" size="sm">
                  Get Started
                </JobzyButton>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#161616] border border-transparent hover:border-[#2a2a2a] transition-all cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C4F167] animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-[#C4F167] hover:underline cursor-pointer"
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
                                ? 'bg-[#181818] border-[#C4F167]/30 text-white'
                                : 'bg-transparent border-[#222222] text-[#A3A3A3]'
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
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
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#141414] border border-[#242424] hover:border-[#383838] transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-[#222222]">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
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
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-[#C4F167]" />
                          Candidate Dashboard
                        </Link>
                      )}
                      {user.role === 'RECRUITER' && (
                        <Link
                          to="/recruiter/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#C4F167]" />
                          Recruiter Dashboard
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#D1D1D1] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C4F167]" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#222222]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
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
        </div>
      </div>
    </header>
  );
};
