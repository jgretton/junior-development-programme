import CoachesController from '@/actions/App/Http/Controllers/Admin/CoachesController';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Player } from '@/types';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
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

export default function UpdateCoachSheet({ player, open, onOpenChange }: UpdatePlayerSheetProps) {
  const [lastValidPlayer, setLastValidPlayer] = React.useState<Player | null>(null);

  React.useEffect(() => {
    if (player) {
      setLastValidPlayer(player);
    }
  }, [player]);

  if (!player?.id && open) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Unable to Load Coach</SheetTitle>
            <SheetDescription>The selected coach could not be found or loaded.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xl text-gray-400">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Coach not found</p>
                <p className="mt-1 text-xs text-gray-500">
                  The coach you're trying to edit may have been deleted or there was an error loading the data.
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
          <SheetTitle>Edit Coach Details</SheetTitle>
          <SheetDescription>Update coach information and settings. Changes will be saved when you click "Save changes".</SheetDescription>
        </SheetHeader>
        <Form {...CoachesController.update.form({ id: parseInt(displayPlayer.id) })} disableWhileProcessing onSuccess={() => onOpenChange(false)}>
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
                  <Label htmlFor="status">Status</Label>
                  {displayPlayer?.status === 'pending' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          Pending Registration
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Status cannot be changed until coach completes registration.</p>
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
                <div className="grid gap-3">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue={displayPlayer?.role?.toLowerCase()}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="junior_development_coach">Junior Dev Coach</SelectItem>
                        <SelectItem value="observer">Observer</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <InputError message={errors.role} />
                </div>
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
