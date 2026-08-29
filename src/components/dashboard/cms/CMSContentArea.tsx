import React, { useState } from 'react';
import { 
  ArrowLeft,
  Pencil,
  Save,
  Eye,
  Trash2,
  PlusCircle,
  MoveVertical,
  Image,
  Type,
  Smartphone,
  Monitor,
  Tablet,
  RotateCcw,
  Grid,
  X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

const CMSContentArea: React.FC = () => {
  const { section, subsection } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = () => {
    toast.success("Changes saved successfully!");
    setIsEditing(false);
  };
  
  const handlePreview = () => {
    toast.info("Previewing changes in a new tab");
    // This would open a preview in a real implementation
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const renderContent = () => {
    if (!section || !subsection) {
      return (
        <div className="text-center p-12">
          <h3 className="text-xl font-medium mb-2">Select a section to edit</h3>
          <p className="text-muted-foreground">Choose a section from the sidebar to start editing</p>
        </div>
      );
    }
    
    // Render different content based on section/subsection
    if (section === 'homepage' && subsection === 'hero') {
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Edit Homepage Hero</h1>
              <p className="text-muted-foreground mt-1">Update the main hero section that appears at the top of your homepage</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                {isEditing ? 'Preview' : 'Edit Mode'}
              </Button>
              {isEditing && (
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hero Content</span>
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" onClick={() => setViewMode('desktop')}>
                    <Monitor className={`h-5 w-5 ${viewMode === 'desktop' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setViewMode('tablet')}>
                    <Tablet className={`h-5 w-5 ${viewMode === 'tablet' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setViewMode('mobile')}>
                    <Smartphone className={`h-5 w-5 ${viewMode === 'mobile' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Drag and drop elements to rearrange their order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`bg-background/20 rounded-lg border border-border p-4 ${
                viewMode === 'mobile' ? 'w-[375px]' : 
                viewMode === 'tablet' ? 'w-[768px]' : 'w-full'
              } mx-auto transition-all`}>
                <div className="bg-background/30 border border-dashed border-border rounded-lg p-4 mb-4 cursor-move hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-xs">Heading</Badge>
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoveVertical className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-lime-500">Identity</h2>
                </div>
                
                <div className="bg-background/30 border border-dashed border-border rounded-lg p-4 mb-4 cursor-move hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-xs">Price</Badge>
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoveVertical className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">$400</h3>
                </div>
                
                <div className="bg-background/30 border border-dashed border-border rounded-lg p-4 mb-4 cursor-move hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-xs">Feature List</Badge>
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoveVertical className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center mr-2">✓</div>
                      Brand Logo
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center mr-2">✓</div>
                      Typography
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-lime-500 flex items-center justify-center mr-2">✓</div>
                      Colors
                    </li>
                  </ul>
                </div>
                
                {isEditing && (
                  <Button variant="outline" className="w-full border-dashed">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Content Block
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Auto-save</p>
                <Switch />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Revert
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize this section for search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Meta Title</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 rounded-md border border-border bg-background/50"
                    defaultValue="Identity Design Services | DesignJockey"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <textarea 
                    className="w-full px-3 py-2 rounded-md border border-border bg-background/50 min-h-[80px]"
                    defaultValue="Professional identity design services tailored for your brand. Includes logo, typography, colors, and more. Get started with DesignJockey today!"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 rounded-md border border-border bg-background/50"
                    defaultValue="identity design, branding, logo design, brand colors, typography"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    
    // Default content
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-medium mb-2">Edit {section} - {subsection}</h3>
        <p className="text-muted-foreground">Content editor for this section is under development</p>
      </div>
    );
  };
  
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default CMSContentArea;
