import React from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart2, CheckCircle2, DollarSign, Users } from 'lucide-react';

export interface AdminDashboardStats {
  totalUsers: number;
  totalClients: number;
  totalDesigners: number;
  pendingBriefs: number;
  totalBriefs: number;
  completedBriefs: number;
  totalRevenue: number;
}

interface AdminStatsProps {
  stats: AdminDashboardStats | null;
  isLoading?: boolean;
}

const STAT_CARDS: {
  key: keyof AdminDashboardStats;
  label: string;
  icon: React.ElementType;
  bgClass: string;
  iconColorClass: string;
  format: (stats: AdminDashboardStats) => string;
  subtitle?: (stats: AdminDashboardStats) => string | null;
}[] = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    bgClass: 'bg-[#c5fb00]/20',
    iconColorClass: 'text-[#c5fb00]',
    format: (s) => s.totalUsers.toLocaleString(),
    subtitle: (s) => `${s.totalClients} clients · ${s.totalDesigners} designers`,
  },
  {
    key: 'pendingBriefs',
    label: 'Pending Briefs',
    icon: BarChart2,
    bgClass: 'bg-amber-500/20',
    iconColorClass: 'text-amber-500',
    format: (s) => s.pendingBriefs.toLocaleString(),
    subtitle: () => 'Awaiting assignment or action',
  },
  {
    key: 'completedBriefs',
    label: 'Completed Briefs',
    icon: CheckCircle2,
    bgClass: 'bg-blue-500/20',
    iconColorClass: 'text-blue-500',
    format: (s) => s.completedBriefs.toLocaleString(),
    subtitle: (s) => `${s.totalBriefs} total briefs`,
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: DollarSign,
    bgClass: 'bg-green-500/20',
    iconColorClass: 'text-green-500',
    format: (s) => `₹${s.totalRevenue.toLocaleString()}`,
  },
];

const AdminStatsDisplay: React.FC<AdminStatsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx} className="bg-secondary/30 border-border animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-secondary rounded w-1/3" />
                  <div className="h-6 bg-secondary rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAT_CARDS.map(({ label, icon: Icon, bgClass, iconColorClass, format, subtitle }) => (
        <Card key={label} className="bg-secondary/30 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                <Icon className={`h-6 w-6 ${iconColorClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">{label}</p>
                <p className="text-2xl font-bold">{format(stats)}</p>
                
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsDisplay;
