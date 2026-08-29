
import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/dashboard/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';
import { CalendarDays, Download } from 'lucide-react';

const userActivityData = [
  { name: 'Mon', clients: 20, designers: 8, admins: 2 },
  { name: 'Tue', clients: 25, designers: 10, admins: 3 },
  { name: 'Wed', clients: 22, designers: 12, admins: 2 },
  { name: 'Thu', clients: 30, designers: 15, admins: 3 },
  { name: 'Fri', clients: 35, designers: 20, admins: 4 },
  { name: 'Sat', clients: 15, designers: 5, admins: 1 },
  { name: 'Sun', clients: 10, designers: 3, admins: 1 },
];

const revenueData = [
  { name: 'Jan', revenue: 18000 },
  { name: 'Feb', revenue: 22000 },
  { name: 'Mar', revenue: 19000 },
  { name: 'Apr', revenue: 25000 },
  { name: 'May', revenue: 24000 },
  { name: 'Jun', revenue: 28000 },
  { name: 'Jul', revenue: 32000 },
  { name: 'Aug', revenue: 35000 },
  { name: 'Sep', revenue: 30000 },
  { name: 'Oct', revenue: 32000 },
  { name: 'Nov', revenue: 36000 },
  { name: 'Dec', revenue: 42000 },
];

const projectTypeData = [
  { name: 'Web Design', value: 35 },
  { name: 'Branding', value: 25 },
  { name: 'UI/UX', value: 20 },
  { name: 'Print Design', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalytics: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive data insights and performance metrics
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Custom Range</span>
          </Button>
        </div>
        
        <Button size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-3xl font-bold">245</p>
              <p className="text-sm text-green-500">+12% from last month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-3xl font-bold">$32,450</p>
              <p className="text-sm text-green-500">+8% from last month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-3xl font-bold">42</p>
              <p className="text-sm text-yellow-500">-3% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Weekly user activity by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userActivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clients" fill="#8884d8" name="Clients" />
                    <Bar dataKey="designers" fill="#82ca9d" name="Designers" />
                    <Bar dataKey="admins" fill="#ffc658" name="Admins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue through the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Revenue" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>Projects by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AdminAnalytics;
