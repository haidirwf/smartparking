import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, ErrorState } from '@/components/ui/feedback';
import { FileBarChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportData {
    daily_occupancy: { day: string; rate: number }[];
    hourly_peak: { time: string; bookings: number }[];
}

export const Reports: React.FC = () => {
    // Fetch statistics reports
    const { data, isLoading, error, refetch } = useQuery<ReportData>({
        queryKey: ['adminReports'],
        queryFn: async () => {
            const res = await api.get<ReportData>('/api/admin/reports');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-[350px] w-full" />
            </div>
        );
    }

    if (error || !data) {
        return <ErrorState onRetry={refetch} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-custom">Reports & Analytics</h1>
                    <p className="text-sm text-text-secondary">Analyze system usage and export performance summaries.</p>
                </div>
                <Button className="rounded-xl flex items-center gap-1.5" variant="outline">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Occupancy Trend (Sleek CSS/SVG Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Weekly Occupancy Rate</CardTitle>
                        <CardDescription>Average slot usage percentage per day.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-end justify-between gap-2 pt-6">
                        {data.daily_occupancy.map((d) => (
                            <div key={d.day} className="flex flex-col items-center flex-1 group">
                                <div className="w-full bg-gray-100 rounded-lg h-48 flex items-end overflow-hidden relative">
                                    <div 
                                        className="w-full bg-primary hover:bg-primary-hover transition-all duration-300 rounded-t-lg"
                                        style={{ height: `${d.rate}%` }}
                                    />
                                    {/* Hover rate tooltip */}
                                    <div className="absolute inset-x-0 bottom-full mb-1 text-center text-[10px] font-bold text-text-custom opacity-0 group-hover:opacity-100 transition-opacity">
                                        {d.rate}%
                                    </div>
                                </div>
                                <span className="text-xs text-text-secondary mt-2.5 font-medium">{d.day}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Hourly Bookings Peak (Sleek CSS/SVG Line Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Peak Booking Hours</CardTitle>
                        <CardDescription>Total reservation volume by hour check-ins.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-end justify-between gap-2 pt-6">
                        {data.hourly_peak.map((h) => {
                            const maxBookings = 50;
                            const heightPct = (h.bookings / maxBookings) * 100;
                            return (
                                <div key={h.time} className="flex flex-col items-center flex-1 group">
                                    <div className="w-full bg-gray-100/50 rounded-lg h-48 flex items-end justify-center relative">
                                        <div 
                                            className="w-2.5 bg-primary/20 group-hover:bg-primary/40 rounded-t transition-all"
                                            style={{ height: `${heightPct}%` }}
                                        />
                                        {/* Peak point indicator */}
                                        <div 
                                            className="absolute h-2.5 w-2.5 rounded-full bg-primary border-2 border-white shadow-md transition-all group-hover:scale-125"
                                            style={{ bottom: `calc(${heightPct}% - 5px)` }}
                                        />
                                        <div className="absolute inset-x-0 bottom-full mb-1 text-center text-[10px] font-bold text-text-custom opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h.bookings}
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-secondary mt-2.5 font-medium">{h.time}</span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
