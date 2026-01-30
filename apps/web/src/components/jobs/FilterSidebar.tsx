import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function FilterSidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        <p className="text-sm text-slate-500">Refine your job search</p>
      </div>
      <Separator />

      {/* Experience Level */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Experience Level</h4>
        <div className="space-y-2">
          {["Junior", "Middle", "Senior", "Lead"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox id={`level-${level}`} />
              <Label htmlFor={`level-${level}`} className="text-sm font-normal text-slate-600">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Job Type */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Job Type</h4>
        <div className="space-y-2">
          {["Remote", "On-site", "Hybrid"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={`type-${type}`} />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal text-slate-600">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Salary Range */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none text-slate-900">Salary Range (Monthly)</h4>
        <div className="flex items-center gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="min-salary" className="text-xs text-slate-500">Min ($)</Label>
            <Input id="min-salary" placeholder="1000" type="number" />
          </div>
          <span className="mt-5 text-slate-400">-</span>
          <div className="grid gap-1.5">
            <Label htmlFor="max-salary" className="text-xs text-slate-500">Max ($)</Label>
            <Input id="max-salary" placeholder="8000" type="number" />
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}