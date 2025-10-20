import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface WarningItem {
  id: string | number;
  name: string;
}

interface AssessmentWarningCardProps {
  title: string;
  description: string;
  items: WarningItem[];
}

export function AssessmentWarningCard({ title, description, items }: AssessmentWarningCardProps) {
  if (items.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item.id} variant="outline" className="max-w-full bg-white break-all whitespace-normal dark:bg-orange-900">
              {item.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
