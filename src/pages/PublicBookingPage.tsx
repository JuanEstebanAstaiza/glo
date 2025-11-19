import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { Service, Appointment } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { GloLogo } from '@/components/GloLogo';
const fetchServices = async (): Promise<Service[]> => {
  return api<Service[]>('/api/services');
};
const createAppointment = async (appointmentData: { manicuristId: string; serviceId: string; startTime: string }): Promise<Appointment> => {
  return api<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};
export function PublicBookingPage() {
  const { manicuristId } = useParams<{ manicuristId: string }>();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['services', manicuristId],
    queryFn: fetchServices,
  });
  const appointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      setBookingConfirmed(true);
      toast.success("Appointment booked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to book appointment. Please try again.");
    },
  });
  const handleBooking = () => {
    if (!manicuristId || !selectedServiceId || !selectedDate || !selectedTime) {
      toast.error("Please select a service, date, and time.");
      return;
    }
    const startTime = parse(selectedTime, 'HH:mm', selectedDate);
    appointmentMutation.mutate({
      manicuristId,
      serviceId: selectedServiceId,
      startTime: startTime.toISOString(),
    });
  };
  const selectedService = services?.find(s => s.id === selectedServiceId);
  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-brand-charcoal">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-2">Your appointment is scheduled. You'll receive a confirmation email shortly.</p>
          <Button onClick={() => window.location.reload()} className="mt-6 w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
            Book Another Appointment
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-brand-cream">
      <Toaster richColors />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <GloLogo className="h-12 w-12 mx-auto text-brand-rose mb-4" />
          <h1 className="text-4xl font-bold text-brand-charcoal">Book an Appointment</h1>
          <p className="text-lg text-muted-foreground mt-2">with Manicurist {manicuristId}</p>
        </header>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Scissors className="h-5 w-5 text-brand-rose" /> 1. Select a Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingServices ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : (
                  services?.map(service => (
                    <Button
                      key={service.id}
                      variant={selectedServiceId === service.id ? "default" : "outline"}
                      className={`w-full justify-start text-left h-auto py-3 ${selectedServiceId === service.id ? 'bg-brand-rose text-brand-charcoal' : ''}`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm opacity-80">{service.duration} min - ${service.price / 100}</p>
                      </div>
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className={!selectedServiceId ? 'opacity-50 pointer-events-none' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-brand-rose" /> 2. Choose Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  className="p-0"
                />
                {selectedDate && selectedServiceId && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Available Slots for {format(selectedDate, 'PPP')}</h3>
                    <TimeSlotPicker
                      manicuristId={manicuristId!}
                      serviceId={selectedServiceId}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onTimeSelect={setSelectedTime}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            {selectedService && selectedDate && selectedTime && (
              <Card className="bg-brand-charcoal text-white">
                <CardHeader>
                  <CardTitle>Confirm Your Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Service:</strong> {selectedService.name}</p>
                  <p><strong>Date:</strong> {format(selectedDate, 'PPP')}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Price:</strong> ${selectedService.price / 100}</p>
                  <Button
                    className="w-full mt-4 bg-brand-rose text-brand-charcoal hover:bg-brand-rose/90"
                    onClick={handleBooking}
                    disabled={appointmentMutation.isPending}
                  >
                    {appointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}