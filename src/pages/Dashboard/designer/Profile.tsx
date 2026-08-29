
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/dashboard/ui/tabs';
import { Card, CardContent } from '../../../components/dashboard/ui/card';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Button } from '../../../components/dashboard/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/dashboard/ui/avatar';
import { User, Mail, Phone, Building, MapPin, Calendar, FileText, Award, Clock, Package } from 'lucide-react';
import UserProfileInfo from '../../../components/dashboard/profile/UserProfileInfo';

const DesignerProfile: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">USER PROFILE</h1>
          <p className="text-muted-foreground text-sm">Manage your profile information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
          {/* <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-24"></div>
              <CardContent className="pt-0 relative">
                <div className="flex flex-col items-center -mt-12">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src="/lovable-uploads/1c69d1b5-8d47-4eb7-8a15-d8dc3d6283b0.png" alt="User" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mt-4">Alex Johnson</h2>
                  <Button className="mt-4 w-full">Edit Profile</Button>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>alex.johnson@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
             
                </div>
                
             
              </CardContent>
            </Card>
            
          
          </div> */}
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              
              <TabsContent value="profile" className="space-y-6">
                <UserProfileInfo />
              </TabsContent>
         
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DesignerProfile;
