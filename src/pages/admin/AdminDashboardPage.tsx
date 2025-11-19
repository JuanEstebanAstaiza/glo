import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, BarChart } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Manicurist } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
const fetchManicurists = async (): Promise<Manicurist[]> => {
  return api<Manicurist[]>('/api/admin/manicurists');
};
export function AdminDashboardPage() {
  const { data: manicurists, isLoading } = useQuery<Manicurist[]>({
    queryKey: ['adminManicurists'],
    queryFn: fetchManicurists,
  });
  const stats = React.useMemo(() => {
    if (!manicurists) {
      return { total: 0, active: 0, totalClients: 0 };
    }
    const total = manicurists.length;
    const active = manicurists.filter(m => m.status === 'active').length;
    const totalClients = manicurists.reduce((sum, m) => sum + (m.clientCount || 0), 0);
    return { total, active, totalClients };
  }, [manicurists]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manicurists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.total}</div>}
            <p className="text-xs text-muted-foreground">Total registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.active}</div>}
            <p className="text-xs text-muted-foreground">Currently enabled accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.totalClients}</div>}
            <p className="text-xs text-muted-foreground">Across all manicurists</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}