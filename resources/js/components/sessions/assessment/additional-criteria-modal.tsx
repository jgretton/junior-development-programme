import { CriteriaSelector } from '@/components/sessions/criteria-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CriteriaData } from '@/types/session';
import { useState } from 'react';

interface AdditionalCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteriaData: CriteriaData;
  disabledCriteriaIds?: number[];
  onAdd: (criteriaIds: number[]) => void;
}

export function AdditionalCriteriaModal({ open, onOpenChange, criteriaData, disabledCriteriaIds = [], onAdd }: AdditionalCriteriaModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleAdd = () => {
    if (selectedIds.length > 0) {
      onAdd(selectedIds);
      setSelectedIds([]);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Add Additional Criteria</DialogTitle>
          <DialogDescription>
            Select criteria that players achieved during this session, but weren't part of the original session focus.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <CriteriaSelector
            criteriaData={criteriaData}
            selectedIds={selectedIds}
            disabledIds={disabledCriteriaIds}
            onSelectionChange={setSelectedIds}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={selectedIds.length === 0}>
            Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} Criteria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
