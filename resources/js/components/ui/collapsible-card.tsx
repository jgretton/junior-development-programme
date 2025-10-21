import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleCard({
  title,
  description,
  children,
  open,
  onOpenChange,
  defaultOpen,
  className,
}: CollapsibleCardProps) {
  return (
    <Card className={`py-0 ${className || ''}`}>
      <Collapsible open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="w-full cursor-pointer transition-colors hover:bg-muted/50">
          <CardHeader className="py-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="py-6">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
