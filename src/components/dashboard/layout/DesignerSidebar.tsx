import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckCircle, 
  Calendar, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { SidebarProps } from './MainLayout';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';

const labelTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};

const DesignerSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/designer/dashboard' },
    { label: 'All Briefs', icon: Briefcase, path: '/designer/briefs' },
    { label: 'Progress', icon: CheckCircle, path: '/designer/progress' },
    { label: 'Meetings', icon: Calendar, path: '/designer/meetings' },
    { label: 'User Profile', icon: User, path: '/designer/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  const toggleButtonLabel = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="w-full h-full sticky top-0 bg-sidebar border-r border-border flex flex-col justify-between overflow-x-hidden">
        <div className="flex-1">
          {/* Toggle Button Header */}
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
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {toggleButtonLabel}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation List */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const linkElement = (
              <Link
                key={item.label}
                to={item.path}
                className={`
                  flex items-center gap-5 px-8 py-6 transition-colors text-sm font-medium
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
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    {linkElement}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkElement;
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default DesignerSidebar;
