import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';

import SessionController from '@/actions/App/Http/Controllers/SessionController';
import { CriteriaSelector } from '@/components/sessions/criteria-selector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CreatePageProps } from '@/types/session';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sessions',
    href: '/sessions',
  },
  {
    title: 'Create',
    href: '/sessions/create',
  },
];

export default function CreatePage({ criteria }: CreatePageProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedCriteria, setSelectedCriteria] = React.useState<number[]>([]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sessions" />

      <div className="container mx-auto mt-10 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Heading title="Create a Session" />
        </div>

        <div className="mx-auto">
          <Form {...SessionController.store.form()} resetOnSuccess>
            {({ processing, errors }) => (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name">
                      Name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input id="name" name="name" type="text" required />
                    <InputError message={errors.name} />
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <Label htmlFor="date" className="px-1">
                      Date of session<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" id="date" className="w-full justify-between font-normal">
                          {date ? date.toLocaleDateString() : 'Select date'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setDate(date);
                            setOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="col-span-2 grid gap-3">
                    <Label htmlFor="focus_areas">
                      Focus Areas <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <span className="-mt-2 text-sm text-muted-foreground">Outline the focus elements of the session</span>
                    <Textarea id="focus_areas" name="focus_areas" required />
                    <InputError message={errors.email} />
                  </div>
                </div>
                <div className="mt-10">
                  <p>
                    Criteria Selection <span className="ml-1 text-destructive">*</span>{' '}
                  </p>

                  <div className="mt-3">
                    <CriteriaSelector criteriaData={criteria} selectedIds={selectedCriteria} onSelectionChange={setSelectedCriteria} />
                  </div>

                  {selectedCriteria.map((id) => (
                    <input key={id} type="hidden" name="criteria[]" value={id} />
                  ))}

                  <input type="hidden" name="date" value={date?.toISOString().split('T')[0] || ''} />

                  <Button type="submit">Create Session</Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
