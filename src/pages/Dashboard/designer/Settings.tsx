
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/dashboard/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Switch } from '../../../components/dashboard/ui/switch';
import { Label } from '../../../components/dashboard/ui/label';
import { 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Mail, 
  Smartphone, 
  Clock, 
  Calendar, 
  LogOut, 
  AlertTriangle 
} from 'lucide-react';
import { Input } from '../../../components/dashboard/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';
import { Separator } from '../../../components/dashboard/ui/separator';
import { toast } from 'sonner';

const DesignerSettings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [darkMode, setDarkMode] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [reminders, setReminders] = React.useState(true);
  const [timeZone, setTimeZone] = React.useState('America/Los_Angeles');
  const [language, setLanguage] = React.useState('en-US');
  
  const handleSaveSettings = () => {
    toast.success('Settings updated successfully');
  };
  
  const handleResetPassword = () => {
    toast.success('Password reset link sent to your email');
  };
  
  const handleDeleteAccount = () => {
    toast.error('Account deletion requires additional verification. Please contact support.');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden md:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden md:inline">Account</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage application preferences and localization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <Sun className="h-4 w-4" />
                      <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="font-medium">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="font-medium">Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive notifications in-app and on desktop</p>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <Label htmlFor="reminders" className="font-medium">Deadline Reminders</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">Get reminders before project deadlines</p>
                    </div>
                    <Switch 
                      id="reminders" 
                      checked={reminders} 
                      onCheckedChange={setReminders} 
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="text-sm font-medium mb-3">Notification Frequency</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="radio" id="immediate" name="notification-frequency" className="accent-primary" defaultChecked />
                      <Label htmlFor="immediate">Immediate</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" id="hourly" name="notification-frequency" className="accent-primary" />
                      <Label htmlFor="hourly">Hourly Digest</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" id="daily" name="notification-frequency" className="accent-primary" />
                      <Label htmlFor="daily">Daily Digest</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="font-medium">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter your current password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="font-medium">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-medium">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button className="w-full" onClick={handleResetPassword}>Change Password</Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">Enhance your account security</p>
                      <p className="text-xs text-muted-foreground">Use an authenticator app to add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Set Up 2FA</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Session Management</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">Active Sessions</p>
                      <p className="text-xs text-muted-foreground">You are currently logged in on 2 devices</p>
                    </div>
                    <Button variant="outline">Manage Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>Manage your account status and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-amber-900/10 border border-amber-900/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-600">Account Status</h3>
                        <p className="text-sm text-muted-foreground">
                          Your account is in good standing. You have been a member since March 2020.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Download Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a copy of your personal data including profile information, projects, and preferences.
                    </p>
                    <Button variant="outline" className="mt-2">
                      Request Data Export
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-destructive">Deactivate Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable your account. You can reactivate anytime by logging in.
                    </p>
                    <Button variant="outline" className="mt-2 border-red-600/20 text-red-600 hover:bg-red-600/10">
                      Deactivate Account
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="mt-2"
                      onClick={handleDeleteAccount}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DesignerSettings;
