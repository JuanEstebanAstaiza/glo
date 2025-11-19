import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import type { Subscription } from '@shared/types';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Toaster, toast } from 'sonner';
const fetchSubscriptions = async (): Promise<Subscription[]> => {
  return api<Subscription[]>('/api/admin/subscriptions');
};
const updateSubscription = async (sub: Subscription) => {
  return api(`/api/admin/subscriptions/${sub.id}`, {
    method: 'PUT',
    body: JSON.stringify(sub),
  });
};
export function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { data: subscriptions, isLoading, error } = useQuery<Subscription[]>({
    queryKey: ['adminSubscriptions'],
    queryFn: fetchSubscriptions,
  });
  const mutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
      toast.success('Subscription updated successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update subscription.');
    },
  });
  const handleStatusChange = (subscription: Subscription, status: Subscription['status']) => {
    mutation.mutate({ ...subscription, status });
  };
  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Toaster richColors />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage all manicurist subscriptions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>A list of all subscriptions in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>Failed to load subscriptions. Please try again later.</p>
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manicurist ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renews On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">{sub.manicuristId}</TableCell>
                    <TableCell className="font-medium capitalize">{sub.plan}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{format(new Date(sub.endDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(sub, 'active')}>
                            Set to Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(sub, 'past_due')}>
                            Set to Past Due
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(sub, 'cancelled')}>
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p>No subscriptions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}