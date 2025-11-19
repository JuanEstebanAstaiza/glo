import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Gift, Scissors } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Appointment, Client, Service, RewardsProgram } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
const fetchAppointments = async (): Promise<Appointment[]> => api('/api/appointments');
const fetchClientData = async (): Promise<Client[]> => api('/api/clients');
const fetchServices = async (): Promise<Service[]> => api('/api/services');
const fetchRewardsProgram = async (): Promise<RewardsProgram[]> => api('/api/rewards');
export function ClientDashboardPage() {
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['clientAppointments'],
    queryFn: fetchAppointments,
  });
  const { data: clientData, isLoading: isLoadingClient } = useQuery<Client[]>({
    queryKey: ['clientData'],
    queryFn: fetchClientData,
  });
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
  });
  const { data: rewardsPrograms, isLoading: isLoadingRewards } = useQuery<RewardsProgram[]>({
    queryKey: ['rewardsProgram'],
    queryFn: fetchRewardsProgram,
  });
  const isLoading = isLoadingAppointments || isLoadingClient || isLoadingServices || isLoadingRewards;
  const client = clientData?.[0]; // Assuming the current user is the first client for mock purposes
  const rewardsProgram = rewardsPrograms?.[0];
  const enrichedAppointments = React.useMemo(() => {
    if (!appointments || !services) return [];
    const servicesMap = new Map(services.map(s => [s.id, s]));
    return appointments
      .filter(app => app.clientId === client?.id)
      .map(app => ({
        ...app,
        service: servicesMap.get(app.serviceId),
      }))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [appointments, services, client]);
  const upcomingAppointments = enrichedAppointments.filter(a => new Date(a.startTime) >= new Date() && a.status === 'scheduled');
  const pastAppointments = enrichedAppointments.filter(a => new Date(a.startTime) < new Date());
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Welcome, {client?.name || 'Client'}!</h1>
        <p className="text-muted-foreground">View your appointments and rewards.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-24 w-full" /> : upcomingAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingAppointments.map(app => (
                    <li key={app.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-brand-charcoal">{app.service?.name}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(app.startTime), 'PPP p')}</p>
                      </div>
                      <Badge variant="default">Scheduled</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40 w-full" /> : pastAppointments.length > 0 ? (
                <ul className="space-y-2">
                  {pastAppointments.slice(0, 5).map(app => (
                    <li key={app.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{format(new Date(app.startTime), 'PPP')}</span>
                      <span className="font-medium">{app.service?.name}</span>
                      <Badge variant={app.status === 'completed' ? 'secondary' : 'destructive'} className={app.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                        {app.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No past appointments.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-brand-rose" /> Loyalty Rewards</CardTitle>
              <CardDescription>{rewardsProgram?.name || 'Rewards Program'}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-20 w-full" /> : client && rewardsProgram ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{rewardsProgram.rewardDescription}</p>
                  <Progress value={((client.loyaltyProgress || 0) / rewardsProgram.targetAppointments) * 100} />
                  <p className="text-sm font-medium text-center">
                    {client.loyaltyProgress || 0} / {rewardsProgram.targetAppointments} appointments
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active loyalty program.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}