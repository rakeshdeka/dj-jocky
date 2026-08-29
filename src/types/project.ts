
export type ProjectStatus = 'in_progress' | 'review' | 'completed' | 'pending' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

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
  tasks?: {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed';
  }[];
}

export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalDesigners: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  monthlyRevenue: number;
  supportTickets: number;
}
