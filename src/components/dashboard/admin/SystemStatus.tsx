
import React from 'react';

interface SystemStatusItem {
  name: string;
  value: string | number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

interface SystemStatusProps {
  items: SystemStatusItem[];
}

const SystemStatus: React.FC<SystemStatusProps> = ({ items }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.name} className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm">{item.name}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`${getStatusColor(item.status)} h-2 rounded-full`} 
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemStatus;
