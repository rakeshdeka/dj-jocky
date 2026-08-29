import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DesignerSidebar from './DesignerSidebar';
import AdminSidebar from './AdminSidebar';
import CMSSidebar from '../cms/CMSSidebar';
import { useIsMobile } from '../../../hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDesignerRoute = location.pathname.startsWith('/designer');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCMSRoute = location.pathname.startsWith('/admin/cms');

  // Choose the appropriate sidebar component
  let SidebarComponent: React.FC<SidebarProps>;

  if (isCMSRoute) {
    SidebarComponent = CMSSidebar as unknown as React.FC<SidebarProps>;
  } else if (isAdminRoute) {
    SidebarComponent = AdminSidebar;
  } else if (isDesignerRoute) {
    SidebarComponent = DesignerSidebar;
  } else {
    SidebarComponent = Sidebar;
  }

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 relative">
          <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <DrawerTrigger asChild className="absolute top-4 left-4 z-10">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-[260px] h-screen p-0 rounded-none">
              <SidebarComponent 
                isCollapsed={false} 
                onToggleCollapse={() => setSidebarOpen(false)} 
              />
            </DrawerContent>
          </Drawer>
          <main className="flex-1 overflow-auto p-6 pb-24 pt-16">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Container with Smooth Framer Motion Width Transition */}
        <motion.div
          animate={{ width: isCollapsed ? 64 : 256 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 overflow-hidden"
        >
          <SidebarComponent
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </motion.div>

        {/* Main Content Area automatically expands/contracts */}
        <main className="flex-1 bg-[#101010] overflow-auto px-16 py-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;