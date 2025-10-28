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
      <Head title="Create Session" />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Heading title="Create a Session" />
        </div>

        <Form {...SessionController.store.form()}>
          {({ processing, errors }) => (
            <div className="space-y-8">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-6 text-lg font-semibold">Session Details</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Session Name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input id="name" name="name" type="text" placeholder="e.g., Bronze Skills Training" required />
                    <InputError message={errors.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-left font-normal">
                          {date
                            ? date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                            : 'Select a date'}
                          <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="focus_areas">
                      Focus Areas <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea id="focus_areas" name="focus_areas" placeholder="Describe the key focus areas for this session..." rows={3} />
                    <InputError message={errors.focus_areas} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Criteria Selection<span className="ml-1 text-destructive">*</span>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select the criteria that will be assessed in this session</p>
                </div>
                <CriteriaSelector criteriaData={criteria} selectedIds={selectedCriteria} onSelectionChange={setSelectedCriteria} />
              </div>

              {selectedCriteria.map((id) => (
                <input key={id} type="hidden" name="criteria[]" value={id} />
              ))}
              <input type="hidden" name="date" value={date?.toISOString().split('T')[0] || ''} />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing || selectedCriteria.length === 0 || !date}>
                  {processing ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </AppLayout>
  );
}
