
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  ExternalLink, 
  Image, 
  PieChart, 
  History, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Save
} from 'lucide-react';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../ui/accordion";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const CMSSidebar: React.FC = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | false>("homepage");
  
  const sections = [
    // { 
    //   id: 'homepage',
    //   label: 'Homepage', 
    //   icon: <Home className="h-5 w-5" />,
    //   subsections: [
    //     { id: 'hero', label: 'Hero Section' },
    //     { id: 'services', label: 'Featured Services' },
    //     { id: 'cta', label: 'Call to Action' }
    //   ]
    // },
    { 
      id: 'services',
      label: 'Services', 
      icon: <ShoppingBag className="h-5 w-5" />,
      subsections: [
        { id: 'branding', label: 'Branding' },
        { id: 'website', label: 'Website Design' },
        { id: 'motion', label: 'Motion Graphics' },
        { id: 'add-new', label: 'Add New Service' }
      ]
    },
    { 
      id: 'pricing',
      label: 'Pricing', 
      icon: <CreditCard className="h-5 w-5" />,
      subsections: [
        { id: 'plans', label: 'Subscription Plans' },
        { id: 'features', label: 'Plan Features' }
      ]
    },
    { 
      id: 'blog',
      label: 'Blog', 
      icon: <FileText className="h-5 w-5" />,
      badge: 3,
      subsections: [
        { id: 'posts', label: 'All Posts' },
        { id: 'categories', label: 'Categories' },
        { id: 'create', label: 'Create New Post' }
      ]
    },
    { 
      id: 'footer',
      label: 'Footer', 
      icon: <ExternalLink className="h-5 w-5" />,
      subsections: [
        { id: 'links', label: 'Footer Links' },
        { id: 'social', label: 'Social Media' },
        { id: 'copyright', label: 'Copyright Info' }
      ]
    },
    { 
      id: 'media',
      label: 'Media Library', 
      icon: <Image className="h-5 w-5" />,
      subsections: [
        { id: 'images', label: 'Images' },
        { id: 'videos', label: 'Videos' },
        { id: 'documents', label: 'Documents' }
      ]
    },
    { 
      id: 'analytics',
      label: 'Analytics', 
      icon: <PieChart className="h-5 w-5" />,
      subsections: [
        { id: 'traffic', label: 'Website Traffic' },
        { id: 'behavior', label: 'User Behavior' },
        { id: 'conversions', label: 'Conversions' }
      ]
    },
    { 
      id: 'versions',
      label: 'Version Control', 
      icon: <History className="h-5 w-5" />,
      subsections: [
        { id: 'history', label: 'Edit History' },
        { id: 'backups', label: 'Backups' }
      ]
    },
    { 
      id: 'settings',
      label: 'CMS Settings', 
      icon: <Settings className="h-5 w-5" />,
      subsections: [
        { id: 'general', label: 'General Settings' },
        { id: 'users', label: 'User Access' },
        { id: 'seo', label: 'SEO Settings' }
      ]
    }
  ];

  const handleExpandToggle = (id: string) => {
    setExpanded(expanded === id ? false : id);
  };

  return (
    <div className="w-80 h-full bg-sidebar border-r border-border overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">CMS Dashboard</span>
        </div>
        <Badge variant="outline" className="bg-lime-500/20 text-lime-500 border-lime-500/30">
          Admin
        </Badge>
      </div>
      
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">MANAGE CONTENT</div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
        
        <Accordion 
          type="single" 
          defaultValue="homepage" 
          collapsible
          className="space-y-1"
        >
          {sections.map((section) => (
            <AccordionItem 
              key={section.id} 
              value={section.id}
              className="border-0 bg-background/5 rounded-md overflow-hidden"
            >
              <AccordionTrigger className="py-2 px-3 text-sm hover:bg-accent/30 hover:no-underline">
                <div className="flex items-center space-x-3">
                  {section.icon}
                  <span>{section.label}</span>
                  {section.badge && (
                    <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="pl-9 pr-2 space-y-1">
                  {section.subsections.map((subsection) => (
                    <Link
                      key={`${section.id}-${subsection.id}`}
                      to={`/admin/cms/${section.id}/${subsection.id}`}
                      className="flex items-center text-sm py-1.5 px-3 rounded-md hover:bg-accent/30 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {subsection.id === 'add-new' || subsection.id === 'create' ? (
                        <Plus className="h-3.5 w-3.5 mr-2 text-lime-500" />
                      ) : null}
                      {subsection.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
          <Button size="sm" className="flex-1 bg-lime-600 hover:bg-lime-700">
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CMSSidebar;
