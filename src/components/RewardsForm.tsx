import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { RewardsProgram } from '@shared/types';
const rewardsFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Program name must be at least 2 characters.',
  }),
  targetAppointments: z.preprocess(
    (val) => Number(val || 0),
    z.number().int().positive({
      message: 'Please enter a positive number of appointments.',
    })
  ),
  rewardDescription: z.string().min(5, {
    message: 'Reward description must be at least 5 characters.',
  }),
});
type RewardsFormValues = z.infer<typeof rewardsFormSchema>;
interface RewardsFormProps {
  onSubmit: (values: RewardsFormValues) => void;
  defaultValues?: Partial<RewardsProgram>;
  isSubmitting?: boolean;
}
export function RewardsForm({ onSubmit, defaultValues, isSubmitting }: RewardsFormProps) {
  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsFormSchema),
    defaultValues: {
      name: 'Loyalty Program',
      targetAppointments: 10,
      rewardDescription: 'Get 50% off your next manicure!',
      ...defaultValues,
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Glo Rewards" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAppointments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointments for Reward</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} />
              </FormControl>
              <FormDescription>
                After this many appointments, the client gets a reward.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rewardDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the reward..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
          {isSubmitting ? 'Saving...' : 'Save Program'}
        </Button>
      </form>
    </Form>
  );
}