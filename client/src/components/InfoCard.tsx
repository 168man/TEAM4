import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";

interface InfoCardProps {
  title: string;
  description: string;
  type?: "info" | "warning";
}

export default function InfoCard({ title, description, type = "info" }: InfoCardProps) {
  const Icon = type === "warning" ? AlertCircle : Info;
  const colorClass = type === "warning" ? "text-yellow-500" : "text-blue-500";
  
  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
