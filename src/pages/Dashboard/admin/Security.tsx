
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Switch } from '../../../components/dashboard/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/dashboard/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/dashboard/ui/table';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Input } from '../../../components/dashboard/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { 
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  UserX, 
  Eye, 
  Key, 
  RefreshCw,
  Mail,
  SmartphoneIcon,
  Globe,
  Search
} from 'lucide-react';

const securityEvents = [
  {
    id: 'event-001',
    type: 'login_failed',
    user: 'john@example.com',
    ipAddress: '192.168.1.45',
    location: 'New York, US',
    timestamp: '2023-09-30T14:20:00',
    details: 'Multiple failed login attempts'
  },
  {
    id: 'event-002',
    type: 'password_changed',
    user: 'sarah@example.com',
    ipAddress: '203.0.113.42',
    location: 'London, UK',
    timestamp: '2023-09-29T10:15:00',
    details: 'Password successfully changed'
  },
  {
    id: 'event-003',
    type: 'role_changed',
    user: 'emily@example.com',
    ipAddress: '10.0.0.25',
    location: 'Internal Network',
    timestamp: '2023-09-28T16:45:00',
    details: 'User role changed from client to designer'
  },
  {
    id: 'event-004',
    type: 'account_locked',
    user: 'robert@example.com',
    ipAddress: '198.51.100.27',
    location: 'Sydney, AU',
    timestamp: '2023-09-28T08:30:00',
    details: 'Account locked due to suspicious activity'
  },
  {
    id: 'event-005',
    type: 'api_key_generated',
    user: 'admin@example.com',
    ipAddress: '10.0.0.5',
    location: 'Internal Network',
    timestamp: '2023-09-27T11:20:00',
    details: 'New API key generated for integration'
  }
];

const blockedIPs = [
  {
    id: 'ip-001',
    ipAddress: '203.0.113.100',
    reason: 'Brute force attack',
    attempts: 15,
    blockedAt: '2023-09-28T08:35:00',
    country: 'Unknown'
  },
  {
    id: 'ip-002',
    ipAddress: '192.0.2.25',
    reason: 'Suspicious activity',
    attempts: 8,
    blockedAt: '2023-09-27T14:20:00',
    country: 'Russia'
  },
  {
    id: 'ip-003',
    ipAddress: '198.51.100.55',
    reason: 'Multiple account access attempts',
    attempts: 12,
    blockedAt: '2023-09-25T19:10:00',
    country: 'China'
  }
];

const AdminSecurity: React.FC = () => {
  const getSecurityEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_failed':
        return <UserX className="h-5 w-5 text-yellow-500" />;
      case 'password_changed':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'role_changed':
        return <RefreshCw className="h-5 w-5 text-purple-500" />;
      case 'account_locked':
        return <Lock className="h-5 w-5 text-red-500" />;
      case 'api_key_generated':
        return <Key className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSecurityEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'login_failed':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Login Failed</Badge>;
      case 'password_changed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Password Changed</Badge>;
      case 'role_changed':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Role Changed</Badge>;
      case 'account_locked':
        return <Badge className="bg-red-500 hover:bg-red-600">Account Locked</Badge>;
      case 'api_key_generated':
        return <Badge className="bg-green-500 hover:bg-green-600">API Key Generated</Badge>;
      default:
        return <Badge>{eventType.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Center</h1>
        <p className="text-muted-foreground">
          Protect your platform and monitor security events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <CardTitle className="text-xl">Security Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <p className="text-green-500 font-medium">Secure</p>
              <p className="text-xs text-muted-foreground">Last scan: 2 hours ago</p>
            </div>
            <div className="text-sm text-muted-foreground">
              All security measures are active and no threats detected
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-xl">Login Attempts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <p className="text-lg font-medium">125</p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </div>
            <div className="text-sm text-red-500">
              15 failed login attempts detected
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl">Blocked IPs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <p className="text-lg font-medium">{blockedIPs.length}</p>
              <p className="text-xs text-muted-foreground">Currently blocked</p>
            </div>
            <div className="text-sm">
              <Button variant="outline" size="sm" className="w-full">
                View Blocked IPs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="mb-6">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-secondary/30 border-border">
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Manage platform authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <h4 className="font-medium">Require Strong Passwords</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Minimum 8 characters with numbers and symbols
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <SmartphoneIcon className="h-4 w-4" />
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <h4 className="font-medium">Location-Based Restrictions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verify new login locations for admins
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4" />
                      <h4 className="font-medium">Auto-Lock Accounts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lock after 5 failed login attempts
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-secondary/30 border-border">
              <CardHeader>
                <CardTitle>API Security</CardTitle>
                <CardDescription>Manage API keys and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <h4 className="font-medium">API Key Rotation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Auto-rotate keys every 90 days
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <h4 className="font-medium">IP Restrictions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Limit API access to whitelisted IPs
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <h4 className="font-medium">API Access Logs</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Log all API calls for review
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Current API Keys</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-muted">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Production API Key</p>
                        <p className="text-xs text-muted-foreground">Created 45 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Rotate
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Testing API Key</p>
                        <p className="text-xs text-muted-foreground">Created 15 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Rotate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Generate New API Key</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Security Event Logs</CardTitle>
                  <CardDescription>Recent security events on the platform</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search events..." className="pl-8 w-[220px]" />
                  </div>
                  <Button variant="outline" size="sm">Export Logs</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSecurityEventIcon(event.type)}
                          {getSecurityEventBadge(event.type)}
                        </div>
                      </TableCell>
                      <TableCell>{event.user}</TableCell>
                      <TableCell>{event.ipAddress}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{event.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blocked">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Blocked IP Addresses</CardTitle>
                  <CardDescription>IP addresses blocked due to suspicious activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">Unblock All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Failed Attempts</TableHead>
                    <TableHead>Blocked Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell>{ip.ipAddress}</TableCell>
                      <TableCell>{ip.country}</TableCell>
                      <TableCell>{ip.reason}</TableCell>
                      <TableCell>{ip.attempts}</TableCell>
                      <TableCell>
                        {new Date(ip.blockedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Unblock</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-secondary/30 border-border overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Security Notifications</CardTitle>
          </div>
          <CardDescription>Configure who receives security alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium">Failed Login Attempts</h4>
              <p className="text-sm text-muted-foreground">Notify when multiple failed login attempts are detected</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium">New Admin User Creation</h4>
              <p className="text-sm text-muted-foreground">Notify when a new admin user is created</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium">Security Setting Changes</h4>
              <p className="text-sm text-muted-foreground">Notify when security settings are modified</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-medium">API Key Generation</h4>
              <p className="text-sm text-muted-foreground">Notify when new API keys are created</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="pt-2 border-t border-border">
            <h4 className="font-medium mb-2">Notification Recipients</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-muted">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Robert Johnson</p>
                    <p className="text-xs text-muted-foreground">robert@example.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Admin Team</p>
                    <p className="text-xs text-muted-foreground">admin-team@example.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm">
                Add Recipient
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Notification Settings</Button>
        </CardFooter>
      </Card>
    </MainLayout>
  );
};

export default AdminSecurity;
