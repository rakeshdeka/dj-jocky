
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/dashboard/ui/card';
import { Input } from '../../../components/dashboard/ui/input';
import { Button } from '../../../components/dashboard/ui/button';
import { Switch } from '../../../components/dashboard/ui/switch';
import { Label } from '../../../components/dashboard/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/dashboard/ui/tabs';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Globe,
  Shield,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = React.useState({
    language: 'en',
    timezone: 'UTC-5',
    darkMode: true
  });

  const [securitySettings, setSecuritySettings] = React.useState({
    twoFactorAuth: false,
    loginNotifications: true,
    trustNewDevices: false
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    marketingEmails: false,
    projectUpdates: true,
    billingAlerts: true
  });

  const [activeTab, setActiveTab] = React.useState('general');

  const handleSaveGeneralSettings = () => {
    toast.success('General settings saved successfully');
  };

  const handleSaveSecuritySettings = () => {
    toast.success('Security settings saved successfully');
  };

  const handleSaveNotificationSettings = () => {
    toast.success('Notification preferences saved successfully');
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security</h1>
        <p className="text-muted-foreground">
          Customize your account preferences and application security
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your password, two-factor authentication and login settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>
                Update Password
              </Button>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="login-notifications">Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when a new login is detected
                  </p>
                </div>
                <Switch
                  id="login-notifications"
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trust-devices">Trust New Devices</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically trust new devices when logging in
                  </p>
                </div>
                <Switch
                  id="trust-devices"
                  checked={securitySettings.trustNewDevices}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, trustNewDevices: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSecuritySettings}>
                Save Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle>Login Activity</CardTitle>
            <CardDescription>Recent logins to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">San Francisco, CA</h4>
                  <p className="text-sm text-muted-foreground">Chrome on macOS - IP: 192.168.1.1</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Today, 10:30 AM
                </span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                  Current Device
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">New York, NY</h4>
                  <p className="text-sm text-muted-foreground">Safari on iOS - IP: 192.168.1.2</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Yesterday, 3:45 PM
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">London, UK</h4>
                  <p className="text-sm text-muted-foreground">Firefox on Windows - IP: 192.168.1.3</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  June 15, 2023, 8:12 AM
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>

  );
};

export default Settings;
