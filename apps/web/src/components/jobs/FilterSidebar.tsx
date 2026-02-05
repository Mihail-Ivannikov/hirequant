import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FilterState {
  levels: string[];
  types: string[];
  minSalary: string;
  maxSalary: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
}

export function FilterSidebar({ filters, setFilters, onApply }: FilterSidebarProps) {
  
  const handleCheckboxChange = (category: 'levels' | 'types', value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      
      return { ...prev, [category]: updated };
    });
  };

  const handleSalaryChange = (field: 'minSalary' | 'maxSalary', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        <p className="text-sm text-slate-500">Refine your job search</p>
      </div>
      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Experience Level</h4>
        <div className="space-y-2">
          {["Junior", "Middle", "Senior", "Lead"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox 
                id={`level-${level}`} 
                checked={filters.levels.includes(level)}
                onCheckedChange={() => handleCheckboxChange('levels', level)}
              />
              <Label htmlFor={`level-${level}`} className="text-sm font-normal text-slate-600">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Job Type</h4>
        <div className="space-y-2">
          {["Remote", "On-site", "Hybrid"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type}`}
                checked={filters.types.includes(type)}
                onCheckedChange={() => handleCheckboxChange('types', type)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal text-slate-600">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Salary Range (Monthly)</h4>
        <div className="flex items-center gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="min-salary" className="text-xs text-slate-500">Min ($)</Label>
            <Input 
              id="min-salary" 
              placeholder="1000" 
              type="number"
              value={filters.minSalary}
              onChange={(e) => handleSalaryChange('minSalary', e.target.value)} 
            />
          </div>
          <span className="mt-5 text-slate-400">-</span>
          <div className="grid gap-1.5">
            <Label htmlFor="max-salary" className="text-xs text-slate-500">Max ($)</Label>
            <Input 
              id="max-salary" 
              placeholder="8000" 
              type="number"
              value={filters.maxSalary}
              onChange={(e) => handleSalaryChange('maxSalary', e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={onApply}>
        Apply Filters
      </Button>
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => {
          setFilters({ levels: [], types: [], minSalary: "", maxSalary: "" });
          setTimeout(onApply, 0); 
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
}