import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  Headset,
  Settings,
  Images,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Layers,
  CreditCard,
  Globe,
  Coins,
} from 'lucide-react';
import { Button } from '../ui/button';
import { SidebarProps } from './MainLayout';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const labelTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};

const settingsChildren = [
  { label: 'Categories', path: '/admin/settings/categories', icon: FolderTree },
  { label: 'Services', path: '/admin/settings/services', icon: Layers },
  { label: 'Plans', path: '/admin/settings/plans', icon: CreditCard },
  { label: 'Countries', path: '/admin/settings/countries', icon: Globe },
  { label: 'Currencies', path: '/admin/settings/currencies', icon: Coins },
];

const AdminSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith('/admin/settings');
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', show: true },
    { label: 'Users', icon: Users, path: '/admin/users', show: true },
    { label: 'Projects', icon: Briefcase, path: '/admin/projects', show: true },
    { label: 'Portfolio', icon: Images, path: '/admin/portfolio', show: true },
    { label: 'Meetings', icon: Headset, path: '/admin/meetings', show: true },
    { label: 'Payments', icon: DollarSign, path: '/admin/payments', show: true },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/settings') return isSettingsActive;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleButtonLabel = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';

  const renderNavLink = (item: { label: string; icon: React.ElementType; path: string }, nested = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const linkElement = (
      <Link
        key={item.path}
        to={item.path}
        className={`
          flex items-center gap-5 transition-colors text-sm font-medium
          ${nested ? 'px-8 py-4 pl-14' : 'px-8 py-6'}
          ${active ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}
          ${isCollapsed ? 'justify-center px-0' : ''}
        `}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <motion.span
          animate={{
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? 0 : 200,
          }}
          transition={labelTransition}
          className="truncate whitespace-nowrap overflow-hidden"
          aria-hidden={isCollapsed}
        >
          {item.label}
        </motion.span>
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return linkElement;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="w-full h-full sticky top-0 bg-sidebar border-r border-border flex flex-col justify-between overflow-x-hidden">
        <div className="flex-1">
          <div className="w-full flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={onToggleCollapse}
                  className={`
                    w-full flex items-center px-8 py-8 transition-colors text-sm font-medium
                    text-muted-foreground hover:bg-accent/50 hover:text-foreground
                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                  `}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{toggleButtonLabel}</TooltipContent>
            </Tooltip>
          </div>

          {menuItems.map((item) => renderNavLink(item))}

          {/* Settings with nested submenu */}
          <div>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin/settings/categories"
                    className={`
                      flex items-center justify-center px-0 py-6 transition-colors text-sm font-medium
                      ${isSettingsActive ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}
                    `}
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSettingsOpen((prev) => !prev)}
                  className={`
                    w-full flex items-center gap-5 px-8 py-6 transition-colors text-sm font-medium
                    ${isSettingsActive ? 'bg-accent/60 text-accent-foreground font-semibold' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}
                  `}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">Settings</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {settingsOpen &&
                  settingsChildren.map((child) => renderNavLink(child, true))}
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
