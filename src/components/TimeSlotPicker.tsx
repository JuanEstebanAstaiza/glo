import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface TimeSlotPickerProps {
  manicuristId: string;
  serviceId: string;
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}
const fetchAvailableSlots = async (manicuristId: string, serviceId: string, date: Date): Promise<string[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  return api<string[]>(`/api/availability/${manicuristId}/slots?date=${dateString}&serviceId=${serviceId}`);
};
export function TimeSlotPicker({ manicuristId, serviceId, selectedDate, selectedTime, onTimeSelect }: TimeSlotPickerProps) {
  const { data: slots, isLoading, error } = useQuery<string[]>({
    queryKey: ['availableSlots', manicuristId, serviceId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => fetchAvailableSlots(manicuristId, serviceId, selectedDate),
    enabled: !!manicuristId && !!serviceId && !!selectedDate,
  });
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return <p className="text-sm text-red-600">Could not load time slots. Please try again.</p>;
  }
  if (!slots || slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No available slots for this day.</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map(time => (
        <Button
          key={time}
          variant="outline"
          className={cn(
            "font-semibold",
            selectedTime === time && "bg-brand-rose text-brand-charcoal"
          )}
          onClick={() => onTimeSelect(time)}
        >
          {time}
        </Button>
      ))}
    </div>
  );
}