
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart2, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface DesignerStatsProps {
  inProgressCount: number;
  reviewCount: number;
  completedCount: number;
  unreadMessagesCount: number;
}

const DesignerStats: React.FC<DesignerStatsProps> = ({
  inProgressCount,
  reviewCount,
  completedCount,
  unreadMessagesCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-secondary/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="text-2xl font-bold">{reviewCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/30 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{unreadMessagesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignerStats;
