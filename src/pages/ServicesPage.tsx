import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceForm } from '@/components/ServiceForm';
import { api } from '@/lib/api-client';
import type { Service } from '@shared/types';
import { Toaster, toast } from 'sonner';
const fetchServices = async (): Promise<Service[]> => {
  return api<Service[]>('/api/services');
};
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};
export function ServicesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: fetchServices,
  });
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setFormOpen(false);
      setSelectedService(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || t('services.unexpectedError'));
    },
  };
  const createMutation = useMutation({
    mutationFn: (newService: Omit<Service, 'id' | 'manicuristId'>) => api<Service>('/api/services', { method: 'POST', body: JSON.stringify(newService) }),
    ...mutationOptions,
    onSuccess: () => {
      toast.success(t('services.createSuccess'));
      mutationOptions.onSuccess();
    },
  });
  const updateMutation = useMutation({
    mutationFn: (updatedService: Partial<Service> & { id: string }) => api<Service>(`/api/services/${updatedService.id}`, { method: 'PUT', body: JSON.stringify(updatedService) }),
    ...mutationOptions,
    onSuccess: () => {
      toast.success(t('services.updateSuccess'));
      mutationOptions.onSuccess();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => api(`/api/services/${serviceId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(t('services.deleteSuccess'));
      setAlertOpen(false);
      setSelectedService(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || t('services.deleteError'));
    },
  });
  const handleFormSubmit = (values: any) => {
    if (selectedService) {
      updateMutation.mutate({ ...values, id: selectedService.id });
    } else {
      createMutation.mutate(values);
    }
  };
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormOpen(true);
  };
  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setAlertOpen(true);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Toaster richColors />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">{t('services.title')}</h1>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedService(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> {t('services.addService')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>{selectedService ? t('services.editDialogTitle') : t('services.addDialogTitle')}</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={handleFormSubmit}
              defaultValues={selectedService || undefined}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {t('services.loadError')}: {error.message}
          </div>
        ) : services && services.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">{t('services.name')}</TableHead>
                <TableHead>{t('services.duration')}</TableHead>
                <TableHead>{t('services.price')}</TableHead>
                <TableHead className="text-right">{t('services.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{t('services.durationValue', { duration: service.duration })}</TableCell>
                  <TableCell>{formatCurrency(service.price, service.currency)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('services.openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(service)}>
                          <Edit className="mr-2 h-4 w-4" /> {t('services.editService')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(service)}>
                          <Trash2 className="mr-2 h-4 w-4" /> {t('services.deleteService')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12 border-2 border-dashed border-stone-200 rounded-lg">
            <Scissors className="mx-auto h-12 w-12 text-stone-400" />
            <h3 className="mt-4 text-lg font-medium text-brand-charcoal">{t('services.noServices')}</h3>
            <p className="mt-1 text-sm text-stone-500">
              {t('services.noServicesDescription')}
            </p>
            <div className="mt-6">
               <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                  <DialogTrigger asChild>
                     <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('services.addService')}
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                     <DialogHeader>
                        <DialogTitle>{t('services.addDialogTitle')}</DialogTitle>
                     </DialogHeader>
                     <ServiceForm onSubmit={handleFormSubmit} isSubmitting={createMutation.isPending} />
                  </DialogContent>
               </Dialog>
            </div>
          </div>
        )}
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('services.deleteDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('services.deleteDialogDescription', { serviceName: selectedService?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('services.deleteDialogCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedService) deleteMutation.mutate(selectedService.id);
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('services.deleting') : t('services.deleteDialogConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}