import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import { Badge } from '../../../components/dashboard/ui/badge';
import Search from '../../../components/dashboard/ui/Search';
import { Flag, AlertTriangle, Clock, Star } from 'lucide-react';

// Mock priority briefs data with deadlines and urgency levels
const priorityBriefs = [
  {
    id: 'priority-1',
    category: 'Web Designing',
    client: 'Urgent Web Revamp',
    imageSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IGZpbGw9IiMyMjIiIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIi8+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTIwLjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVIMjAuMjU2YTEuNSAxLjUgMCAwIDEtMS41LTEuNVY0OS41YTEuNSAxLjUgMCAwIDEgMS41LTEuNXoiLz48cGF0aCBkPSJNOTguNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41SDQ1LjAwOGExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5ek0yOTkuNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41aC01Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUgMS41djM5YTEuNSAxLjUgMCAwIDAgMS41IDEuNWg1Mi4yMzZhMS41IDEuNSAwIDAgMCAxLjUtMS41di0zOXpNMTc2LjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVoLTUyLjIzNmExLjUgMS41IDAgMCAxLTEuNS0xLjVWNDkuNWExLjUgMS41IDAgMCAxIDEuNS0xLjV6Ii8+PHBhdGggZD0iTTI1NC43NDQgNDkuNWExLjUgMS41IDAgMCAwLTEuNS0xLjVoLTUyLjIzNmExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5eiIvPjwvZz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNMTQzLjAwOCAxMDVoMTE4LjE1YTEuNSAxLjUgMCAwIDEgMS41IDEuNVYxMzJhMS41IDEuNSAwIDAgMS0xLjUgMS41SDg2LjAwOGExLjUgMS41IDAgMCAxLTEuNS0xLjV2LTI1LjVhMS41IDEuNSAwIDAgMSAxLjUtMS41aDU3eiIvPjwvZz48L2c+PC9zdmc+',
    urgency: 'critical',
    deadline: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Tomorrow
    note: 'Client needs this by tomorrow for investor meeting'
  },
  {
    id: 'priority-2',
    category: 'App UI/UX',
    client: 'Premium Mobile App',
    imageSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IGZpbGw9IiMyMjIiIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIi8+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTIwLjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVIMjAuMjU2YTEuNSAxLjUgMCAwIDEtMS41LTEuNVY0OS41YTEuNSAxLjUgMCAwIDEgMS41LTEuNXoiLz48cGF0aCBkPSJNOTguNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41SDQ1LjAwOGExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5ek0yOTkuNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41aC01Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUgMS41djM5YTEuNSAxLjUgMCAwIDAgMS41IDEuNWg1Mi4yMzZhMS41IDEuNSAwIDAgMCAxLjUtMS41di0zOXpNMTc2LjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVoLTUyLjIzNmExLjUgMS41IDAgMCAxLTEuNS0xLjVWNDkuNWExLjUgMS41IDAgMCAxIDEuNS0xLjV6Ii8+PHBhdGggZD0iTTI1NC43NDQgNDkuNWExLjUgMS41IDAgMCAwLTEuNS0xLjVoLTUyLjIzNmExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5eiIvPjwvZz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNMTQzLjAwOCAxMDVoMTE4LjE1YTEuNSAxLjUgMCAwIDEgMS41IDEuNVYxMzJhMS41IDEuNSAwIDAgMS0xLjUgMS41SDg2LjAwOGExLjUgMS41IDAgMCAxLTEuNS0xLjV2LTI1LjVhMS41IDEuNSAwIDAgMSAxLjUtMS41aDU3eiIvPjwvZz48L2c+PC9zdmc+',
    urgency: 'high',
    deadline: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 3 days from now
    note: 'High-value client, CEO will review personally'
  },
  {
    id: 'priority-3',
    category: 'Branding',
    client: 'Startup Rebrand',
    imageSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IGZpbGw9IiMyMjIiIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIi8+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTIwLjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVIMjAuMjU2YTEuNSAxLjUgMCAwIDEtMS41LTEuNVY0OS41YTEuNSAxLjUgMCAwIDEgMS41LTEuNXoiLz48cGF0aCBkPSJNOTguNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41SDQ1LjAwOGExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5ek0yOTkuNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41aC01Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUgMS41djM5YTEuNSAxLjUgMCAwIDAgMS41IDEuNWg1Mi4yMzZhMS41IDEuNSAwIDAgMCAxLjUtMS41di0zOXpNMTc2LjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVoLTUyLjIzNmExLjUgMS41IDAgMCAxLTEuNS0xLjVWNDkuNWExLjUgMS41IDAgMCAxIDEuNS0xLjV6Ii8+PHBhdGggZD0iTTI1NC43NDQgNDkuNWExLjUgMS41IDAgMCAwLTEuNS0xLjVoLTUyLjIzNmExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5eiIvPjwvZz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNMTQzLjAwOCAxMDVoMTE4LjE1YTEuNSAxLjUgMCAwIDEgMS41IDEuNVYxMzJhMS41IDEuNSAwIDAgMS0xLjUgMS41SDg2LjAwOGExLjUgMS41IDAgMCAxLTEuNS0xLjV2LTI1LjVhMS41IDEuNSAwIDAgMSAxLjUtMS41aDU3eiIvPjwvZz48L2c+PC9zdmc+',
    urgency: 'medium',
    deadline: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 5 days from now
    note: 'Featured client, needs rush service'
  }
];

const PriorityBriefs: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredBriefs = priorityBriefs.filter(brief => 
    brief.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500 flex items-center gap-1"><Flag className="h-3 w-3" /> High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-500/20 text-orange-500 border-orange-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Medium</Badge>;
      default:
        return null;
    }
  };

  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Priority Projects</h1>
            <p className="text-muted-foreground">High-priority and urgent tasks requiring attention</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search placeholder="Search priority projects..." onSearch={handleSearch} className="w-full md:w-[200px]" />
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Priority Projects
            </CardTitle>
            <CardDescription>Urgent projects that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBriefs.length > 0 ? (
              <div className="space-y-4">
                {filteredBriefs.map(brief => (
                  <Card key={brief.id} className="overflow-hidden border-border hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-32 h-32 bg-muted/30 flex-shrink-0">
                        <img 
                          src={brief.imageSrc} 
                          alt={brief.category} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg">{brief.client}</h3>
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {brief.category}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getUrgencyBadge(brief.urgency)}
                            <span className="text-sm text-red-500 font-medium">
                              {getDaysUntil(brief.deadline) <= 0 
                                ? 'Due today!' 
                                : `${getDaysUntil(brief.deadline)} days left`}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                          {brief.note}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No priority projects match your search</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PriorityBriefs;
