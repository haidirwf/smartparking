import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/feedback';
import { Search } from 'lucide-react';

export const Bookings: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState('');

    // Fetch Bookings
    const { data: bookings, isLoading, error, refetch } = useQuery<Booking[]>({
        queryKey: ['adminBookings', search],
        queryFn: async () => {
            const res = await api.get<Booking[]>(API_ENDPOINTS.BOOKINGS); // Fetch all
            return res.data;
        }
    });

    // Force Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const res = await api.post(`/api/staff/check-out`, { qr_code: bookings?.find(b => b.id === bookingId)?.qr_code });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
        }
    });

    const handleForceCheckout = (id: string) => {
        if (confirm('Are you sure you want to end this parking session?')) {
            checkoutMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (error) {
        return <ErrorState onRetry={refetch} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">Parking Bookings</h1>
                <p className="text-sm text-text-secondary">View active sessions, historical records, and trigger administrative check-outs.</p>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Session Logs</CardTitle>
                        <CardDescription>Comprehensive log of all booked parking sessions.</CardDescription>
                    </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search plate or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-xl border border-border-custom bg-white pl-10 pr-3.5 text-xs text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>QR Token</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Floor / Slot</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings?.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-mono text-xs font-semibold">{booking.qr_code}</TableCell>
                                    <TableCell>{booking.user?.name}</TableCell>
                                    <TableCell>{booking.slot?.floor?.name} — {booking.slot?.slot_number}</TableCell>
                                    <TableCell className="font-mono font-semibold">{booking.vehicle?.plate_number}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                booking.status === 'completed'
                                                    ? 'success'
                                                    : booking.status === 'active'
                                                    ? 'default'
                                                    : booking.status === 'pending'
                                                    ? 'warning'
                                                    : 'danger'
                                            }
                                            className="capitalize"
                                        >
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {booking.status === 'active' && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                className="rounded-xl text-xs"
                                                onClick={() => handleForceCheckout(booking.id)}
                                            >
                                                Force End
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
