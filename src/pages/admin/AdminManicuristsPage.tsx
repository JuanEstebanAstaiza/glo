import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import type { Manicurist } from '@shared/types';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
const fetchManicurists = async (): Promise<Manicurist[]> => {
  return api<Manicurist[]>('/api/admin/manicurists');
};
const updateManicuristStatus = async ({ id, status }: { id: string; status: Manicurist['status'] }) => {
  return api(`/api/admin/manicurists/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};
export function AdminManicuristsPage() {
  const queryClient = useQueryClient();
  const { data: manicurists, isLoading, error } = useQuery<Manicurist[]>({
    queryKey: ['adminManicurists'],
    queryFn: fetchManicurists,
  });
  const mutation = useMutation({
    mutationFn: updateManicuristStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminManicurists'] });
      toast.success('Manicurist status updated.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status.');
    },
  });
  const handleStatusChange = (manicurist: Manicurist, checked: boolean) => {
    const newStatus = checked ? 'active' : 'disabled';
    mutation.mutate({ id: manicurist.id, status: newStatus });
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Toaster richColors />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Manicurists</h1>
        <p className="text-muted-foreground">View and manage all registered accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manicurist Accounts</CardTitle>
          <CardDescription>A list of all manicurists in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>Failed to load manicurists. Please try again later.</p>
            </div>
          ) : manicurists && manicurists.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-center">Clients</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manicurists.map(manicurist => (
                  <TableRow key={manicurist.id}>
                    <TableCell className="font-medium">{manicurist.name}</TableCell>
                    <TableCell>{manicurist.email}</TableCell>
                    <TableCell>{format(new Date(manicurist.registrationDate), 'PPP')}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{manicurist.clientCount || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm capitalize">{manicurist.status}</span>
                        <Switch
                          checked={manicurist.status === 'active'}
                          onCheckedChange={(checked) => handleStatusChange(manicurist, checked)}
                          disabled={mutation.isPending}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p>No manicurists found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}