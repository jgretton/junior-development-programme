import PlayerController from '@/actions/App/Http/Controllers/Admin/PlayerController';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { Form } from '@inertiajs/react';
import { ChevronDown, FileSpreadsheet, LoaderCircle, UploadIcon } from 'lucide-react';
import * as React from 'react';
import InputError from '../input-error';
import { Button } from '../ui/button';

export default function MassAddPlayerModal() {
  const [open, setOpen] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<File[] | undefined>();
  const [uploadError, setUploadError] = React.useState<string>('');

  const handleDrop = (files: File[]) => {
    setFiles(files);
    setUploadError(''); // Clear error on successful drop
  };

  const handleError = (error: Error) => {
    console.error(error);
    setUploadError('Please upload a valid CSV file only.');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="ml-0.5 rounded-l-none" size={'icon'}>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Additional Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <FileSpreadsheet /> Add Multiple Players (csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
          <Form {...PlayerController.store.form()} resetOnSuccess onSuccess={() => setOpen(false)}>
            {({ processing }) => (
              <div className="grid gap-5">
                <DialogHeader>
                  <DialogTitle>Add Multiple Players</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file containing player information. Each player will receive an email invitation to register.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Dropzone
                      onDrop={handleDrop}
                      onError={handleError}
                      src={files}
                      accept={{ 'text/csv': ['.csv'] }}
                      maxFiles={1}
                      maxSize={1024 * 1024 * 10}>
                      <DropzoneEmptyState>
                        <div className="flex w-full items-center gap-4 p-8">
                          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <UploadIcon size={24} />
                          </div>
                          <div className="text-left text-wrap">
                            <p className="text-sm font-medium">Upload CSV file</p>
                            <p className="text-xs text-muted-foreground">Drag and drop or click to upload a CSV file</p>
                          </div>
                        </div>
                      </DropzoneEmptyState>
                      <DropzoneContent />
                    </Dropzone>
                    <InputError message={uploadError} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={processing || !files} data-test="">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Upload & Send Invites
                  </Button>
                </DialogFooter>
              </div>
            )}
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
