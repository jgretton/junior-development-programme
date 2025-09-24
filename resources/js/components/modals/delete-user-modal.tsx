import CoachesController from '@/actions/App/Http/Controllers/Admin/CoachesController';
import PlayerController from '@/actions/App/Http/Controllers/Admin/PlayerController';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Player } from '@/types';
import { Form } from '@inertiajs/react';
import { AlertTriangleIcon, LoaderCircle, Trash2Icon } from 'lucide-react';

interface PageProps {
  type: 'player' | 'coach';
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserModal({ type, player, open, onOpenChange }: PageProps) {
  if (!player) return null;

  console.log(player.id);

  const getFormProps = () => {
    switch (type) {
      case 'player':
        return PlayerController.destroy.form(parseInt(player.id));
      case 'coach':
        return CoachesController.destroy.form({ id: parseInt(player.id) });
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangleIcon className="size-6 text-red-600" />
          </div>
          <div className="w-full flex-1 px-4">
            <AlertDialogHeader className="space-y-2 p-0">
              <AlertDialogTitle className="text-center text-lg font-medium">Delete User</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500">
                This will permanently delete <strong>{player.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                <div className="text-xs text-red-700">
                  <p className="font-medium">Warning: This action cannot be undone.</p>
                  <p className="mt-1">
                    All associated player data, registration information, and history will be permanently removed from the system.
                  </p>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="mt-6 w-full">
              <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
              <Form {...getFormProps()} onSubmitComplete={() => onOpenChange(false)} className="w-full">
                {({ processing }) => (
                  <Button variant="destructive" className="w-full" disabled={processing}>
                    {processing ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2Icon /> Delete
                      </>
                    )}
                  </Button>
                )}
              </Form>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
