import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, User, Scissors, Tag } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Appointment, Client, Service } from '@shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
type EnrichedAppointment = Appointment & {
  client?: Client;
  service?: Service;
};
const fetchAppointments = async (): Promise<Appointment[]> => api('/api/appointments');
const fetchClients = async (): Promise<Client[]> => api('/api/clients');
const fetchServices = async (): Promise<Service[]> => api('/api/services');
export function AppointmentsPage() {
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
  });
  const isLoading = isLoadingAppointments || isLoadingClients || isLoadingServices;
  const enrichedAppointments = React.useMemo<EnrichedAppointment[]>(() => {
    if (!appointments || !clients || !services) return [];
    const clientsMap = new Map(clients.map(c => [c.id, c]));
    const servicesMap = new Map(services.map(s => [s.id, s]));
    return appointments
      .map(app => ({
        ...app,
        client: clientsMap.get(app.clientId),
        service: servicesMap.get(app.serviceId),
      }))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [appointments, clients, services]);
  const renderStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Appointments</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : enrichedAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-stone-400" />
              <h3 className="mt-4 text-lg font-medium text-brand-charcoal">No appointments found</h3>
              <p className="mt-1 text-sm text-stone-500">Your booked appointments will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><User className="inline-block h-4 w-4 mr-1" />Client</TableHead>
                  <TableHead><Scissors className="inline-block h-4 w-4 mr-1" />Service</TableHead>
                  <TableHead><Calendar className="inline-block h-4 w-4 mr-1" />Date & Time</TableHead>
                  <TableHead><Tag className="inline-block h-4 w-4 mr-1" />Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedAppointments.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.client?.name || 'Unknown Client'}</TableCell>
                    <TableCell>{app.service?.name || 'Unknown Service'}</TableCell>
                    <TableCell>{format(new Date(app.startTime), 'PPP p')}</TableCell>
                    <TableCell>{renderStatusBadge(app.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}