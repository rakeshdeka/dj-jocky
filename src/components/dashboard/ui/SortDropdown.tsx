
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  defaultValue?: string;
  value?: string; // Added value prop
  onSort?: (value: string) => void;
  onValueChange?: (value: string) => void; // Added onValueChange prop
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  defaultValue,
  value,
  onSort,
  onValueChange,
}) => {
  const handleValueChange = (val: string) => {
    if (onSort) {
      onSort(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  // Use controlled or uncontrolled component based on prop presence
  const selectProps = value !== undefined 
    ? { value, onValueChange: handleValueChange } 
    : { defaultValue, onValueChange: handleValueChange };

  return (
    <Select {...selectProps}>
      <SelectTrigger className="w-[180px] bg-muted/50 border-border">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
