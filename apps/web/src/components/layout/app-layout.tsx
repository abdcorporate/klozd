'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { NotificationsCenter } from '@/components/notifications/notifications-center';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

      const navItems = [
        { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'CLOSER', 'SETTER', 'SUPER_ADMIN'] },
        { path: '/pages', label: 'Pages', roles: ['ADMIN'] },
        { path: '/leads', label: 'Leads', roles: ['ADMIN', 'SETTER', 'MANAGER'] },
        { path: '/scheduling', label: 'Calendrier', roles: ['ADMIN', 'CLOSER', 'MANAGER'] },
        { path: '/organizations', label: 'Organisations', roles: ['SUPER_ADMIN'] },
        { path: '/users', label: 'Utilisateurs', roles: ['ADMIN', 'MANAGER', 'SUPER_ADMIN'] },
        { path: '/waitlist', label: 'Waitlist', roles: ['SUPER_ADMIN'] },
        { path: '/settings', label: 'Paramètres', roles: ['ADMIN', 'MANAGER', 'CLOSER', 'SETTER'] },
      ].filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Animation de fond professionnelle - uniquement sur dashboard */}
      {pathname === '/dashboard' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Gradient animé */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dd7200] opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-400 opacity-5 rounded-full blur-3xl animate-pulse-slow-delayed"></div>
          </div>
          
          {/* Lignes animées */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradientLayout" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dd7200" stopOpacity="0" />
                <stop offset="50%" stopColor="#dd7200" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#dd7200" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#lineGradientLayout)" strokeWidth="1" className="animate-line-draw" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="url(#lineGradientLayout)" strokeWidth="1" className="animate-line-draw-delayed" />
          </svg>
        </div>
      )}
      
      {/* Header professionnel */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link href="/dashboard" className="flex items-center flex-shrink-0 group">
                <Image
                  src="/logo.png"
                  alt="KLOZD"
                  width={180}
                  height={60}
                  className="h-10 w-auto flex-shrink-0 transition-opacity group-hover:opacity-90"
                  priority
                  unoptimized
                />
              </Link>
              <nav className="ml-10 flex space-x-1 overflow-x-auto flex-1 min-w-0 scrollbar-hide">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive(item.path)
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <NotificationsCenter />
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span>
                      {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                       user.role === 'ADMIN' ? 'Admin' : 
                       user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </span>
                    {user.organizationName && (
                      <span className="text-slate-600 font-medium"> • {user.organizationName}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}


