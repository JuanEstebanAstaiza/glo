import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { RewardsProgram } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RewardsForm } from '@/components/RewardsForm';
const fetchRewardsProgram = async (): Promise<RewardsProgram | null> => {
  try {
    const programs = await api<RewardsProgram[]>('/api/rewards');
    return programs[0] || null; // Assuming one program per manicurist for now
  } catch (error) {
    // API likely returns 404 or empty array if not found, which api client throws.
    // We can treat this as a non-error state, meaning no program exists yet.
    return null;
  }
};
export function RewardsPage() {
  const queryClient = useQueryClient();
  const { data: rewardsProgram, isLoading, error } = useQuery<RewardsProgram | null>({
    queryKey: ['rewardsProgram'],
    queryFn: fetchRewardsProgram,
    retry: false, // Don't retry on 404s
  });
  const mutation = useMutation({
    mutationFn: (programData: Omit<RewardsProgram, 'id' | 'manicuristId'>) => {
      const endpoint = rewardsProgram ? `/api/rewards/${rewardsProgram.id}` : '/api/rewards';
      const method = rewardsProgram ? 'PUT' : 'POST';
      return api<RewardsProgram>(endpoint, { method, body: JSON.stringify(programData) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardsProgram'] });
      toast.success('Rewards program saved successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save rewards program.');
    },
  });
  const handleFormSubmit = (values: Omit<RewardsProgram, 'id' | 'manicuristId'>) => {
    mutation.mutate(values);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Toaster richColors />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Loyalty & Rewards</h1>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-brand-rose" />
            Your Rewards Program
          </CardTitle>
          <CardDescription>
            Encourage repeat business by rewarding your loyal clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          ) : error ? (
            <p className="text-red-600">Failed to load rewards program data.</p>
          ) : (
            <RewardsForm
              onSubmit={handleFormSubmit}
              defaultValues={rewardsProgram || undefined}
              isSubmitting={mutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}