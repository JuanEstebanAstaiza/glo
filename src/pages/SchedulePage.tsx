import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AvailabilityForm } from '@/components/AvailabilityForm';
import { api } from '@/lib/api-client';
import type { Availability } from '@shared/types';
import { Toaster, toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
const fetchAvailability = async (): Promise<Availability[]> => {
  return api<Availability[]>('/api/availability');
};
const daysOfWeek: Availability['dayOfWeek'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { data: availabilityData, isLoading, error } = useQuery<Availability[]>({
    queryKey: ['availability'],
    queryFn: fetchAvailability,
  });
  const updateMutation = useMutation({
    mutationFn: (updatedAvailability: Availability[]) => api<Availability[]>('/api/availability', { method: 'PUT', body: JSON.stringify(updatedAvailability) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setFormOpen(false);
      toast.success('Availability updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update availability.');
    },
  });
  const handleFormSubmit = (values: Availability[]) => {
    updateMutation.mutate(values);
  };
  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability>();
    if (availabilityData) {
      availabilityData.forEach(item => map.set(item.dayOfWeek, item));
    }
    return map;
  }, [availabilityData]);
  const fullAvailability = useMemo(() => {
    return daysOfWeek.map(day => {
      const existing = availabilityMap.get(day);
      if (existing) return existing;
      return {
        id: `mock-manicurist-id-${day}`,
        manicuristId: 'mock-manicurist-id',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isEnabled: false,
      };
    });
  }, [availabilityMap]);
  const renderAvailability = () => {
    if (isLoading) {
      return Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ));
    }
    if (error) {
      return <p className="text-red-600 text-center">Failed to load availability.</p>;
    }
    return fullAvailability.map(day => (
      <div key={day.dayOfWeek} className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-charcoal capitalize">{day.dayOfWeek}</span>
        {day.isEnabled ? (
          <span className="text-sm text-brand-charcoal font-semibold">{day.startTime} - {day.endTime}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Unavailable</span>
        )}
      </div>
    ));
  };
  const EditTrigger = (
    <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
      Edit Availability
    </Button>
  );
  const FormDialog = isMobile ? Sheet : Dialog;
  const FormDialogTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const FormDialogContent = isMobile ? SheetContent : DialogContent;
  const FormDialogHeader = isMobile ? SheetHeader : DialogHeader;
  const FormDialogTitle = isMobile ? SheetTitle : DialogTitle;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Toaster richColors />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">My Schedule</h1>
        <FormDialog open={isFormOpen} onOpenChange={setFormOpen}>
          <FormDialogTrigger asChild>{EditTrigger}</FormDialogTrigger>
          <FormDialogContent className="bg-white" side={isMobile ? 'bottom' : undefined}>
            <FormDialogHeader>
              <FormDialogTitle>Edit Weekly Availability</FormDialogTitle>
            </FormDialogHeader>
            <div className={isMobile ? "p-4 overflow-y-auto max-h-[70vh]" : "p-4"}>
              {isLoading ? (
                <p>Loading form...</p>
              ) : (
                <AvailabilityForm
                  onSubmit={handleFormSubmit}
                  defaultValues={fullAvailability}
                  isSubmitting={updateMutation.isPending}
                />
              )}
            </div>
          </FormDialogContent>
        </FormDialog>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3"
                classNames={{
                  day_selected: "bg-brand-rose text-brand-charcoal hover:bg-brand-rose/90 focus:bg-brand-rose",
                  today: "bg-brand-rose/20 text-brand-charcoal",
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>Your standard working hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderAvailability()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}