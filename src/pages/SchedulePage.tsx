import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
export function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">My Schedule</h1>
        <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white">
          Edit Availability
        </Button>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3"
                classNames={{
                  day_selected: "bg-brand-rose text-brand-charcoal hover:bg-brand-rose/90 focus:bg-brand-rose",
                  today: "bg-brand-rose/20 text-brand-charcoal",
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>Your standard working hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-charcoal">{day}</span>
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  </div>
                ))}
              </div>
               <p className="text-xs text-muted-foreground mt-4 text-center">
                Full availability editing coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}