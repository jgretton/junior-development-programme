import PlayerController from '@/actions/App/Http/Controllers/Admin/PlayerController';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { LoaderCircle, PlusIcon } from 'lucide-react';
import InputError from '../input-error';

export default function AddPlayerModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon /> Add New Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <Form {...PlayerController.store.form()} resetOnSuccess>
          {({ processing, errors }) => (
            <div className="grid gap-5">
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
                <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name" name="name" type="text" required />
                  <InputError message={errors.name} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                  <InputError message={errors.email} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="guardian_email">Guardian Email</Label>
                  <span className="-mt-2 text-xs text-muted-foreground">Only required if player is a junior</span>
                  <Input id="guardian_email" name="guardian_email" type="email" />
                  <InputError message={errors.guardian_email} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={processing} data-test="">
                  {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Send Email Invite
                </Button>
              </DialogFooter>
            </div>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
