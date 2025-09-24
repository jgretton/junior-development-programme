import PlayerController from '@/actions/App/Http/Controllers/Admin/PlayerController';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Player } from '@/types';
import { Form } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import InputError from '../input-error';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface UpdatePlayerSheetProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdatePlayerSheet({ player, open, onOpenChange }: UpdatePlayerSheetProps) {
  const [showGuardian, setShowGuardian] = React.useState<boolean>(false);
  const guardianInputRef = React.useRef<HTMLInputElement>(null);
  const [lastValidPlayer, setLastValidPlayer] = React.useState<Player | null>(null);

  React.useEffect(() => {
    if (player) {
      setShowGuardian(!!player.guardian_email);
      setLastValidPlayer(player);
    }
  }, [player]);

  const handleRemoveGuardian = () => {
    if (guardianInputRef.current) {
      guardianInputRef.current.value = '';
    }
    setShowGuardian(false);
  };
  if (!player?.id && open) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Unable to Load Player</SheetTitle>
            <SheetDescription>The selected player could not be found or loaded.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xl text-gray-400">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Player not found</p>
                <p className="mt-1 text-xs text-gray-500">
                  The player you're trying to edit may have been deleted or there was an error loading the data.
                </p>
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Use last valid player data during closing animation to preserve smooth close
  const displayPlayer = player || lastValidPlayer;

  if (!displayPlayer?.id) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Player Details</SheetTitle>
          <SheetDescription>Update player information and settings. Changes will be saved when you click "Save changes".</SheetDescription>
        </SheetHeader>
        <Form {...PlayerController.update.form({ player: parseInt(displayPlayer.id) })} disableWhileProcessing onSuccess={() => onOpenChange(false)}>
          {({ processing, errors }) => (
            <>
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required defaultValue={displayPlayer?.name} />
                  <InputError message={errors.name} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" required defaultValue={displayPlayer?.email} />
                  <InputError message={errors.email} />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="sheet-demo-username">Status</Label>
                  {displayPlayer?.status === 'pending' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          Pending Registration
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        Status cannot be changed until player completes registration.
                      </p>
                      <Button variant="outline" className="w-full" type="button">
                        Resend Invitation Link
                      </Button>
                      {/* Hidden input to prevent client-side validation error */}
                      <input type="hidden" name="status" value="pending" />
                    </div>
                  ) : (
                    <Select name="status" defaultValue={displayPlayer?.status?.toLowerCase()}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                  <InputError message={errors.status} />
                </div>
                {showGuardian ? (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="guardian-email">Guardian Email</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveGuardian}
                        className="h-auto p-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove Guardian
                      </Button>
                    </div>
                    <Input
                      ref={guardianInputRef}
                      id="guardian-email"
                      name="guardian_email"
                      type="email"
                      placeholder="guardian@example.com"
                      defaultValue={displayPlayer?.guardian_email || ''}
                    />
                    <p className="text-xs text-muted-foreground">Required for players under 18 years old</p>
                    <InputError message={errors.guardian_email} />
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowGuardian(true)}
                    className="flex w-full items-center justify-start gap-2 rounded-md border border-dashed border-gray-300 p-4 text-left hover:bg-gray-50">
                    <Plus className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Add Guardian Email</span>
                  </Button>
                )}
              </div>

              <SheetFooter>
                <Button type="submit" disabled={processing}>
                  {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" type="button">
                    Close
                  </Button>
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </Form>
      </SheetContent>
    </Sheet>
  );
}
