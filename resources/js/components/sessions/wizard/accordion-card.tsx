import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, ChevronUp, Lock, Pencil } from 'lucide-react';

export type AccordionCardStatus = 'locked' | 'active' | 'completed';

interface AccordionCardProps {
  title: string;
  stepNumber: number;
  status: AccordionCardStatus;
  onEdit?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  canContinue?: boolean;
  children: React.ReactNode;
}

export function AccordionCard({
  title,
  stepNumber,
  status,
  onEdit,
  onContinue,
  continueLabel = 'Continue',
  canContinue = true,
  children,
}: AccordionCardProps) {
  const isExpanded = status === 'active';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isCompleted && 'border-green-500 bg-green-50/50 dark:bg-green-950/20',
        isLocked && 'opacity-60'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              isCompleted && 'bg-green-500 text-white',
              status === 'active' && 'bg-primary text-primary-foreground',
              isLocked && 'bg-muted text-muted-foreground'
            )}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}
          {!isLocked && (
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent>{children}</CardContent>
          {onContinue && (
            <div className="flex justify-end px-6 pb-6">
              <Button onClick={onContinue} disabled={!canContinue}>
                {continueLabel}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
