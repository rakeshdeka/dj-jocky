
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import { Button } from '../../../components/dashboard/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/dashboard/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/dashboard/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Badge } from '../../../components/dashboard/ui/badge';
import { Calendar, Download, FileDown, Filter, Printer, RefreshCcw } from 'lucide-react';

// Sample data for reports
const userRegistrationData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 15 },
  { month: 'Mar', count: 18 },
  { month: 'Apr', count: 14 },
  { month: 'May', count: 22 },
  { month: 'Jun', count: 26 },
  { month: 'Jul', count: 24 },
  { month: 'Aug', count: 28 },
  { month: 'Sep', count: 32 },
  { month: 'Oct', count: 30 },
  { month: 'Nov', count: 35 },
  { month: 'Dec', count: 40 },
];

const projectCompletionData = [
  { month: 'Jan', completed: 8, canceled: 2 },
  { month: 'Feb', completed: 10, canceled: 1 },
  { month: 'Mar', completed: 12, canceled: 2 },
  { month: 'Apr', completed: 9, canceled: 3 },
  { month: 'May', completed: 15, canceled: 1 },
  { month: 'Jun', completed: 18, canceled: 0 },
  { month: 'Jul', completed: 16, canceled: 2 },
  { month: 'Aug', completed: 20, canceled: 1 },
  { month: 'Sep', completed: 22, canceled: 3 },
  { month: 'Oct', completed: 21, canceled: 2 },
  { month: 'Nov', completed: 25, canceled: 1 },
  { month: 'Dec', completed: 28, canceled: 2 },
];

const financialReportData = [
  { id: 'F-2023-12', period: 'Dec 2023', revenue: 42500, expenses: 18200, profit: 24300, status: 'final' },
  { id: 'F-2023-11', period: 'Nov 2023', revenue: 36800, expenses: 16500, profit: 20300, status: 'final' },
  { id: 'F-2023-10', period: 'Oct 2023', revenue: 32400, expenses: 15800, profit: 16600, status: 'final' },
  { id: 'F-2023-09', period: 'Sep 2023', revenue: 30200, expenses: 14900, profit: 15300, status: 'final' },
  { id: 'F-2023-08', period: 'Aug 2023', revenue: 35100, expenses: 16200, profit: 18900, status: 'final' },
  { id: 'F-2023-07', period: 'Jul 2023', revenue: 32000, expenses: 14800, profit: 17200, status: 'final' },
];

const AdminReports: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate and export detailed platform reports
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Select defaultValue="last6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCcw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button size="sm" className="gap-1">
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user">User Reports</TabsTrigger>
          <TabsTrigger value="project">Project Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>Monthly user registration counts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userRegistrationData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="User Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="project">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>Project Completion Rate</CardTitle>
              <CardDescription>Monthly completed and canceled projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectCompletionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#82ca9d" name="Completed Projects" />
                    <Bar dataKey="canceled" fill="#ff8884" name="Canceled Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle>Financial Summaries</CardTitle>
              <CardDescription>Monthly financial summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialReportData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>${report.revenue.toLocaleString()}</TableCell>
                      <TableCell>${report.expenses.toLocaleString()}</TableCell>
                      <TableCell>${report.profit.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AdminReports;
