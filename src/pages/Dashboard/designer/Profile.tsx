
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/dashboard/ui/tabs';
import UserProfileInfo from '../../../components/dashboard/profile/UserProfileInfo';
import SecuritySettings from '../../../components/dashboard/profile/SecuritySettings';

const DesignerProfile: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">USER PROFILE</h1>
          <p className="text-muted-foreground text-sm">Manage your profile and account security</p>
        </div>

        <Tabs defaultValue="profile" className="w-full font-sans">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <UserProfileInfo />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DesignerProfile;
