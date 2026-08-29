
import React from 'react';
import { DollarSign, Shield, Users } from 'lucide-react';

interface Activity {
  id: string;
  type: 'user' | 'security' | 'payment' | 'project' | 'support';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-5 w-5 text-primary" />;
      case 'security':
        return <Shield className="h-5 w-5 text-primary" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-primary" />;
      default:
        return <Users className="h-5 w-5 text-primary" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            {getIcon(activity.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{activity.title}</p>
              <span className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
