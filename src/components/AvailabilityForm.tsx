import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Availability } from '@shared/types';
import { cn } from '@/lib/utils';
const availabilitySchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isEnabled: z.boolean(),
});
const formSchema = z.object({
  availability: z.array(availabilitySchema),
}).refine(data => {
  for (const day of data.availability) {
    if (day.isEnabled) {
      if (!day.startTime || !day.endTime) return false;
      if (day.startTime >= day.endTime) return false;
    }
  }
  return true;
}, {
  message: "For enabled days, start time must be before end time.",
});
type AvailabilityFormValues = z.infer<typeof formSchema>;
interface AvailabilityFormProps {
  onSubmit: (values: AvailabilityFormValues['availability']) => void;
  defaultValues: Availability[];
  isSubmitting?: boolean;
}
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export function AvailabilityForm({ onSubmit, defaultValues, isSubmitting }: AvailabilityFormProps) {
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availability: defaultValues,
    },
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: "availability",
  });
  const handleSubmit = (data: AvailabilityFormValues) => {
    onSubmit(data.availability);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isEnabled = form.watch(`availability.${index}.isEnabled`);
            return (
              <div key={field.id} className="p-4 border rounded-lg bg-stone-50">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-medium text-brand-charcoal">
                    {capitalize(field.dayOfWeek)}
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name={`availability.${index}.isEnabled`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className={cn("grid grid-cols-2 gap-4 mt-4 transition-all duration-300", isEnabled ? "opacity-100" : "opacity-50 pointer-events-none")}>
                  <FormField
                    control={form.control}
                    name={`availability.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`availability.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {form.formState.errors.availability && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.availability.message || form.formState.errors.availability.root?.message}</p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
          {isSubmitting ? 'Saving...' : 'Save Availability'}
        </Button>
      </form>
    </Form>
  );
}