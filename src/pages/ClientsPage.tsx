import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Calendar, Gift } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Client } from '@shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
const fetchClients = async (): Promise<Client[]> => api('/api/clients');
export function ClientsPage() {
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Clients</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Client List</CardTitle>
          <CardDescription>View and manage your client information.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>Failed to load clients. Please try again later.</p>
            </div>
          ) : clients && clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Users className="inline-block h-4 w-4 mr-1" />Name</TableHead>
                  <TableHead><Mail className="inline-block h-4 w-4 mr-1" />Email</TableHead>
                  <TableHead className="text-center"><Calendar className="inline-block h-4 w-4 mr-1" />Appointments</TableHead>
                  <TableHead><Gift className="inline-block h-4 w-4 mr-1" />Loyalty Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{client.totalAppointments || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {client.loyaltyProgress !== undefined && client.targetAppointments ? (
                        <div className="flex items-center gap-2">
                          <Progress value={(client.loyaltyProgress / client.targetAppointments) * 100} className="w-[60%]" />
                          <span className="text-sm text-muted-foreground font-medium">
                            {client.loyaltyProgress}/{client.targetAppointments}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No program</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-stone-400" />
              <h3 className="mt-4 text-lg font-medium text-brand-charcoal">No clients found</h3>
              <p className="mt-1 text-sm text-stone-500">Your clients will appear here once they book an appointment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}