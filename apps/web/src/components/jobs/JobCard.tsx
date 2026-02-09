import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Sparkles, MapPin, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom"; 

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  skills: string[];
  matchScore?: number;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <Card className="group transition-all hover:shadow-md border-slate-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-slate-500">{job.company}</p>
        </div>
        
        {job.matchScore && (
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${getScoreColor(job.matchScore)}`}>
            <Sparkles className="h-3 w-3" />
            {job.matchScore}% Match
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location} ({job.type})
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {job.salary}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {job.postedAt}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Link to={`/jobs/${job.id}`} className="w-full">
          <Button className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 shadow-none">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}