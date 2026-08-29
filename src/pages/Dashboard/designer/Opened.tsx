
import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
// import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import Search from '../../../components/dashboard/ui/Search';
import SortDropdown from '../../../components/dashboard/ui/SortDropdown';
import { Badge } from '../../../components/dashboard/ui/badge';
import { toast } from 'sonner';

// Mock active briefs data with client progress statuses
const activeBriefs = Array.from({ length: 6 }, (_, index) => ({
  id: `active-brief-${index + 1}`,
  category: index % 3 === 0 ? 'Web Designing' : index % 3 === 1 ? 'App UI/UX' : 'Branding',
  client: `Active Client ${index + 1}`,
  imageSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IGZpbGw9IiMyMjIiIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIi8+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTIwLjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVIMjAuMjU2YTEuNSAxLjUgMCAwIDEtMS41LTEuNVY0OS41YTEuNSAxLjUgMCAwIDEgMS41LTEuNXoiLz48cGF0aCBkPSJNOTguNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41SDQ1LjAwOGExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5ek0yOTkuNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41aC01Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUgMS41djM5YTEuNSAxLjUgMCAwIDAgMS41IDEuNWg1Mi4yMzZhMS41IDEuNSAwIDAgMCAxLjUtMS41di0zOXpNMTc2LjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVoLTUyLjIzNmExLjUgMS41IDAgMCAxLTEuNS0xLjVWNDkuNWExLjUgMS41IDAgMCAxIDEuNS0xLjV6Ii8+PHBhdGggZD0iTTI1NC43NDQgNDkuNWExLjUgMS41IDAgMCAwLTEuNS0xLjVoLTUyLjIzNmExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5eiIvPjwvZz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNMTQzLjAwOCAxMDVoMTE4LjE1YTEuNSAxLjUgMCAwIDEgMS41IDEuNVYxMzJhMS41IDEuNSAwIDAgMS0xLjUgMS41SDg2LjAwOGExLjUgMS41IDAgMCAxLTEuNS0xLjV2LTI1LjVhMS41IDEuNSAwIDAgMSAxLjUtMS41aDU3eiIvPjwvZz48L2c+PC9zdmc+',
  clientStatus: index % 4 === 0 ? 'In Progress' : index % 4 === 1 ? 'Awaiting Feedback' : index % 4 === 2 ? 'Revision Needed' : 'Pending',
  progress: index % 4 === 0 ? 40 : index % 4 === 1 ? 75 : index % 4 === 2 ? 60 : 25,
  lastUpdate: index % 2 === 0 ? '2 days ago' : '1 hour ago',
  hasNewMessages: index % 3 === 0
}));

const OpenedBriefs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [briefs, setBriefs] = useState(activeBriefs);
  
  // Simulate real-time updates from client progress
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldUpdate = Math.random() > 0.8;
      
      if (shouldUpdate) {
        const briefIndex = Math.floor(Math.random() * briefs.length);
        const statuses = ['In Progress', 'Awaiting Feedback', 'Revision Needed', 'Pending'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (briefs[briefIndex].clientStatus !== newStatus) {
          const updatedBriefs = [...briefs];
          updatedBriefs[briefIndex] = {
            ...updatedBriefs[briefIndex],
            clientStatus: newStatus,
            lastUpdate: 'just now'
          };
          
          setBriefs(updatedBriefs);
          
          toast.info(`Project "${updatedBriefs[briefIndex].client}" status updated to ${newStatus}`, {
            position: 'bottom-right',
            duration: 3000
          });
        }
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [briefs]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  const filteredBriefs = briefs.filter(brief => 
    brief.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.clientStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced BriefCard rendering with status badges
  const renderEnhancedBriefs = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBriefs.map(brief => (
          <Card key={brief.id} className="overflow-hidden border border-border hover:border-primary/50 transition-colors">
            <div className="relative h-40 bg-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={brief.imageSrc} 
                  alt={brief.category} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute top-3 right-3 flex space-x-2">
                <Badge 
                  className={
                    brief.clientStatus === 'In Progress' ? 'bg-blue-600' : 
                    brief.clientStatus === 'Awaiting Feedback' ? 'bg-purple-600' :
                    brief.clientStatus === 'Revision Needed' ? 'bg-orange-500' :
                    'bg-yellow-600'
                  }
                >
                  {brief.clientStatus}
                </Badge>
                
                {brief.hasNewMessages && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
                    New Message
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-1">{brief.category}</h3>
              <p className="text-muted-foreground text-sm mb-2">Client: {brief.client}</p>
              
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{brief.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        brief.clientStatus === 'In Progress' ? 'bg-blue-600' : 
                        brief.clientStatus === 'Awaiting Feedback' ? 'bg-purple-600' :
                        brief.clientStatus === 'Revision Needed' ? 'bg-orange-500' :
                        'bg-yellow-600'
                      }`} 
                      style={{ width: `${brief.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Updated: {brief.lastUpdate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opened Projects</h1>
            <p className="text-muted-foreground">Active projects currently being worked on</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search placeholder="Search projects..." onSearch={handleSearch} className="w-full md:w-[200px]" />
            <SortDropdown 
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'a-z', label: 'A-Z' },
                { value: 'z-a', label: 'Z-A' }
              ]}
              value={sortOption}
              onValueChange={handleSort}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your current open projects in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBriefs.length > 0 ? (
              renderEnhancedBriefs()
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No active projects match your search</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OpenedBriefs;
