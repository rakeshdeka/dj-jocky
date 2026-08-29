import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = 'Search Brief', 
  onSearch,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="py-2 pl-10 pr-4 w-full bg-muted/50 border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        placeholder={placeholder}
        onChange={handleChange}
      />
    </div>
  );
};

export default Search;