import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: string | number;
}

interface AssessmentSummaryCardProps {
  items: SummaryItem[];
}

export function AssessmentSummaryCard({ items }: AssessmentSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={index}>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
