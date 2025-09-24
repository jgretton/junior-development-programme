import CoachesController from '@/actions/App/Http/Controllers/Admin/CoachesController';
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
import { useState } from 'react';
import InputError from '../input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

export default function AddCoachModal() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon /> Add New Coach
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <Form {...CoachesController.store.form()} resetOnSuccess onSuccess={() => setOpen(false)}>
          {({ processing, errors }) => (
            <div className="grid gap-5">
              <DialogHeader>
                <DialogTitle>Add New Coach</DialogTitle>
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
                  <Label htmlFor="guardian_email">Role</Label>
                  <Select name="role">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="junior_development_coach">Junior Development Coach</SelectItem>
                        <SelectItem value="observer">Observer</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.role} />
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
