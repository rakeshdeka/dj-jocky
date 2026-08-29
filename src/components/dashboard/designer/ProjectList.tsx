
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar, Flag } from 'lucide-react';

export type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: ProjectStatus;
  deadline: string;
  progress: number;
  type: string;
  priority: ProjectPriority;
  unreadMessages: number;
  lastUpdate: string;
  thumbnail: string;
  tasks: {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
  }[];
}

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  selectedProjectId?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelectProject,
  selectedProjectId
}) => {
  const renderStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">In Progress</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">Review</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">Completed</Badge>;
      default:
        return null;
    }
  };

  const renderPriorityFlag = (priority: ProjectPriority) => {
    switch (priority) {
      case 'high':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Flag className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Card className="bg-secondary/30 border-border overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>Active Projects</CardTitle>
        <CardDescription>Your ongoing design projects</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[400px]">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map(project => (
                <div 
                  key={project.id} 
                  className={`p-4 rounded-lg border border-border ${
                    selectedProjectId === project.id 
                      ? 'bg-muted' 
                      : 'bg-background/50 hover:bg-background/80'
                  } transition-colors cursor-pointer`}
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{project.name}</h3>
                        {/* {renderPriorityFlag(project.priority)} */}
                      </div>
                      {/* <p className="text-sm text-muted-foreground">Client: {project.client}</p> */}
                    </div>
                    <div className="flex items-center justify-center gap-2 tex-xs">
                      {renderStatusBadge(project.status)}
                      {/* {project.unreadMessages > 0 && (
                        <Badge variant="default" className="bg-blue-600">
                          {project.unreadMessages} 
                        </Badge>
                      )} */}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {formatDate(project.deadline)}</span>
                    </div>
                    {/* {getDaysRemaining(project.deadline) > 0 ? (
                      <span>{getDaysRemaining(project.deadline)} days left</span>
                    ) : (
                      <span className="text-red-500">Overdue</span>
                    )} */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No projects match your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ProjectList;
