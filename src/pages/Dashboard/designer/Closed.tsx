
import React from 'react';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/dashboard/ui/card';
import BriefsGrid from '../../../components/dashboard/dashboard/BriefsGrid';
import Search from '../../../components/dashboard/ui/Search';
import SortDropdown from '../../../components/dashboard/ui/SortDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/dashboard/ui/select';

// Mock completed briefs data
const completedBriefs = Array.from({ length: 8 }, (_, index) => ({
  id: `completed-brief-${index + 1}`,
  category: index % 3 === 0 ? 'Web Designing' : index % 3 === 1 ? 'App UI/UX' : 'Branding',
  client: `Completed Client ${index + 1}`,
  imageSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IGZpbGw9IiMyMjIiIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIi8+PGcgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTIwLjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUtMS41SDQ1LjAwOGExLjUgMS41IDAgMCAxLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDUyLjIzNmExLjUgMS41IDAgMCAwIDEuNS0xLjV2LTM5ek0yOTkuNzQ0IDQ5LjVhMS41IDEuNSAwIDAgMC0xLjUtMS41aC01Mi4yMzZhMS41IDEuNSAwIDAgMC0xLjUgMS41djM5YTEuNSAxLjUgMCAwIDAgMS41IDEuNWg1Mi4yMzZhMS41IDEuNSAwIDAgMCAxLjUtMS41di0zOXpNMTc2LjI1NiA0OGg1Mi4yMzZhMS41IDEuNSAwIDAgMSAxLjUgMS41VjEzMmExLjUgMS41IDAgMCAxLTEuNSAxLjVoLTUyLjIzNmExLjUgMS41IDAgMCAxLTEuNS0xLjVWNDkuNWExLjUgMS41IDAgMCAxIDEuNS0xLjV6Ii8+PHBhdGggZD0iTTI1NC43NDQgNDkuNWExLjUgMS41IDAgMCAwLTEuNS0xLjVoLTUyLjIzNmExLjUgMS41IDAgMCAwLTEuNSAxLjV2MzlhMS41IDEuNSAwIDAgMCAxLjUgMS41aDU3eiIvPjwvZz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNMTQzLjAwOCAxMDVoMTE4LjE1YTEuNSAxLjUgMCAwIDEgMS41IDEuNVYxMzJhMS41IDEuNSAwIDAgMS0xLjUgMS41SDg2LjAwOGExLjUgMS41IDAgMCAxLTEuNS0xLjV2LTI1LjVhMS41IDEuNSAwIDAgMSAxLjUtMS41aDU3eiIvPjwvZz48L2c+PC9zdmc+',
  completedDate: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // Past dates
}));

const ClosedBriefs: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOption, setSortOption] = React.useState('newest');
  const [timeFilter, setTimeFilter] = React.useState('all');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  // Filter briefs based on search term and time filter
  const filteredBriefs = completedBriefs
    .filter(brief => 
      (brief.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (timeFilter === 'all' || filterByTime(brief.completedDate, timeFilter))
    );

  function filterByTime(dateString: string, filter: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filter) {
      case 'last-week':
        return diffDays <= 7;
      case 'last-month':
        return diffDays <= 30;
      case 'last-3-months':
        return diffDays <= 90;
      default:
        return true;
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Closed Projects</h1>
            <p className="text-muted-foreground">Completed projects and archived briefs</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Search placeholder="Search projects..." onSearch={handleSearch} />
            <SortDropdown 
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'a-z', label: 'A-Z' },
                { value: 'z-a', label: 'Z-A' }
              ]}
              defaultValue={sortOption}
              onValueChange={handleSort}
            />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="last-week">Last week</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="last-3-months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>Your finished projects and client briefs</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBriefs.length > 0 ? (
              <BriefsGrid briefs={filteredBriefs} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No completed projects match your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClosedBriefs;
