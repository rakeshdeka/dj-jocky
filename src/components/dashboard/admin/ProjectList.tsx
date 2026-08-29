import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProjectListProps {
  projects: any[];
  title?: string;
  isLoading?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, title, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#c5fb00]" />
        <p className="text-xs text-muted-foreground animate-pulse tracking-wider uppercase text-[10px] font-bold">
          Loading project queue...
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-border rounded-md">
        <p className="text-muted-foreground text-sm italic">Queue is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <table className="w-full font-sans">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase">Project</th>
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase text-center">Status</th>
            <th className="pb-3 font-semibold text-muted-foreground text-[10px] uppercase text-right">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-secondary border border-border overflow-hidden shrink-0">
                    <img 
                      src={project.thumbnail_url || 'https://placehold.co/100x100?text=Design'} 
                      alt="" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{project.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">Client: {project.client_id?.name || 'Guest'}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-center">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase
                  ${project.status === 'assigned' ? 'bg-blue-500/10 text-blue-500' : ''}
                  ${project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                  ${project.status === 'completed' ? 'bg-green-500/10 text-green-500' : ''}
                `}>
                  {project.status}
                </span>
              </td>
              <td className="py-3 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-medium">
                    {new Date(project.delivery_date).toLocaleDateString()}
                  </span>
                  <span className={`text-[9px] font-bold uppercase ${project.priority === 'high' ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {project.priority}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;