import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Manicurist } from '@shared/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, User, Star, Search } from 'lucide-react';
const fetchManicurists = async (): Promise<Manicurist[]> => {
  return api<Manicurist[]>('/api/admin/manicurists');
};
export function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: manicurists, isLoading, error } = useQuery<Manicurist[]>({
    queryKey: ['allManicurists'],
    queryFn: fetchManicurists,
  });
  const filteredManicurists = useMemo(() => {
    if (!manicurists) return [];
    return manicurists.filter(m =>
      m.status === 'active' &&
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       m.location?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [manicurists, searchTerm]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-charcoal tracking-tight">Discover Artisans</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find and book talented nail artists near you.</p>
      </header>
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or location (e.g., 'New York, NY')"
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <main>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>Failed to load manicurists. Please try again later.</p>
          </div>
        ) : filteredManicurists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredManicurists.map(artisan => (
              <Card key={artisan.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="bg-brand-rose/20 h-32 flex items-center justify-center">
                    <User className="h-16 w-16 text-brand-rose" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <CardTitle className="text-xl">{artisan.name}</CardTitle>
                  {artisan.location && (
                    <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4" /> {artisan.location}
                    </p>
                  )}
                  <div className="flex justify-center items-center text-sm text-muted-foreground mt-3">
                    <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" /> 5.0 (24 reviews)
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
                    <Link to={`/book/${artisan.id}`}>View Profile & Book</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-stone-400" />
            <h3 className="mt-4 text-lg font-medium text-brand-charcoal">No Artisans Found</h3>
            <p className="mt-1 text-sm text-stone-500">Try adjusting your search terms.</p>
          </div>
        )}
      </main>
    </div>
  );
}