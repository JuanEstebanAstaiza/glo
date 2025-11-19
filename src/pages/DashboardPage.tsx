import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, BarChart } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Appointment } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
const fetchAppointments = async (): Promise<Appointment[]> => {
  return api<Appointment[]>('/api/appointments');
};
export function DashboardPage() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
  const upcomingAppointments = React.useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(a => new Date(a.startTime) >= new Date() && a.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [appointments]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Welcome back!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your business.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              (Feature coming soon)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              (Feature coming soon)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bookings Overview
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              (Feature coming soon)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Next Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <ul className="space-y-2">
                {upcomingAppointments.slice(0, 5).map(app => (
                  <li key={app.id} className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{format(new Date(app.startTime), 'PPP p')}</span>
                    {' - '} with Client ID: {app.clientId.substring(0, 8)}...
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}