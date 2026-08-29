
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, Mail, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type NotificationType = 'email' | 'push' | 'sms';
type NotificationCategory = 'account' | 'projects' | 'marketing' | 'system';

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  channels: {
    [key in NotificationType]: boolean;
  };
};

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'account-updates',
      title: 'Account Updates',
      description: 'Changes to your account, password resets',
      category: 'account',
      channels: {
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: 'billing-alerts',
      title: 'Billing Alerts',
      description: 'Payment confirmations, billing updates',
      category: 'account',
      channels: {
        email: true,
        push: false,
        sms: true
      }
    },
    {
      id: 'project-updates',
      title: 'Project Updates',
      description: 'Design changes, feedback requests',
      category: 'projects',
      channels: {
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: 'deadline-reminders',
      title: 'Deadline Reminders',
      description: 'Upcoming project deadlines',
      category: 'projects',
      channels: {
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: 'promotional-offers',
      title: 'Promotional Offers',
      description: 'Discounts, special offers, promotions',
      category: 'marketing',
      channels: {
        email: false,
        push: false,
        sms: false
      }
    },
    {
      id: 'newsletter',
      title: 'Newsletter',
      description: 'Monthly product updates and news',
      category: 'marketing',
      channels: {
        email: true,
        push: false,
        sms: false
      }
    },
    {
      id: 'system-alerts',
      title: 'System Alerts',
      description: 'System maintenance, downtime',
      category: 'system',
      channels: {
        email: true,
        push: true,
        sms: false
      }
    }
  ]);
  
  const [recentNotifications] = useState([
    {
      id: '1',
      title: 'Payment Processed',
      message: 'Your payment of $933.00 was successfully processed.',
      date: '2 days ago',
      type: 'billing'
    },
    {
      id: '2',
      title: 'Project Update',
      message: 'Your design brief "Website Redesign" has been updated.',
      date: '1 week ago',
      type: 'project'
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'New login detected from San Francisco, CA.',
      date: '2 weeks ago',
      type: 'security'
    }
  ]);
  
  const toggleNotification = (id: string, channel: NotificationType) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === id) {
        return {
          ...notification,
          channels: {
            ...notification.channels,
            [channel]: !notification.channels[channel]
          }
        };
      }
      return notification;
    }));
    
    toast.success('Notification preference updated');
  };
  
  const toggleAllInCategory = (category: NotificationCategory, channel: NotificationType, value: boolean) => {
    setNotifications(notifications.map(notification => {
      if (notification.category === category) {
        return {
          ...notification,
          channels: {
            ...notification.channels,
            [channel]: value
          }
        };
      }
      return notification;
    }));
    
    toast.success(`${value ? 'Enabled' : 'Disabled'} all ${category} notifications for ${channel}`);
  };
  
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'account':
        return <Bell className="h-5 w-5 text-primary" />;
      case 'projects':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'marketing':
        return <Mail className="h-5 w-5 text-primary" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };
  
  const getChannelIcon = (channel: NotificationType) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getNotificationTypeByCategory = (category: NotificationCategory) => {
    return notifications.filter(notification => notification.category === category);
  };
  
  const categories: { [key in NotificationCategory]: string } = {
    account: 'Account & Billing',
    projects: 'Projects & Deadlines',
    marketing: 'Marketing & Promotions',
    system: 'System & Security'
  };
  
  const channels: { [key in NotificationType]: string } = {
    email: 'Email',
    push: 'Push',
    sms: 'SMS'
  };
  
  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Notification Settings</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {(Object.keys(categories) as NotificationCategory[]).map((category) => (
            <Card key={category} className="bg-secondary/30 border-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-medium text-lg">{categories[category]}</h3>
                </div>
                
                <div className="border-b border-border pb-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1"></div>
                    {(Object.keys(channels) as NotificationType[]).map((channel) => (
                      <div key={channel} className="flex justify-center">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-background/50 flex items-center justify-center mb-1">
                            {getChannelIcon(channel)}
                          </div>
                          <span className="text-xs text-muted-foreground">{channels[channel]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {getNotificationTypeByCategory(category).map((notification) => (
                    <div key={notification.id} className="grid grid-cols-4 items-center">
                      <div className="col-span-1">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.description}</p>
                        </div>
                      </div>
                      
                      {(Object.keys(channels) as NotificationType[]).map((channel) => (
                        <div key={channel} className="flex justify-center">
                          <Switch
                            checked={notification.channels[channel]}
                            onCheckedChange={() => toggleNotification(notification.id, channel)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    {(Object.keys(channels) as NotificationType[]).map((channel) => {
                      const allEnabled = getNotificationTypeByCategory(category).every(
                        notification => notification.channels[channel]
                      );
                      
                      return (
                        <Button
                          key={channel}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => toggleAllInCategory(category, channel, !allEnabled)}
                        >
                          {allEnabled ? 'Disable' : 'Enable'} all {channels[channel]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="bg-secondary/30 border-border">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg">Recent Notifications</h3>
                </div>
                
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              notification.type === 'billing'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                : notification.type === 'security'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'bg-green-500/10 text-green-500 border-green-500/30'
                            }`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
