import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import { Booking } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton, EmptyState } from '@/components/ui/feedback';

export const MyBookings: React.FC = () => {
    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['myBookings'],
        queryFn: async () => {
            const res = await api.get<Booking[]>(API_ENDPOINTS.BOOKINGS);
            return res.data;
        }
    });

    const getStatusBadge = (status: Booking['status']) => {
        switch (status) {
            case 'completed': return <Badge variant="success">Completed</Badge>;
            case 'active': return <Badge variant="default">Active Session</Badge>;
            case 'pending': return <Badge variant="warning">Awaiting Arrival</Badge>;
            case 'expired': return <Badge variant="danger">Expired</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">My Bookings</h1>
                <p className="text-sm text-text-secondary">View your active and historic parking reservations.</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : bookings && bookings.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>QR Token</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Floor / Slot</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Arrival Target</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs font-semibold">{booking.qr_code}</TableCell>
                                <TableCell>{booking.slot?.floor?.area?.name}</TableCell>
                                <TableCell>{booking.slot?.floor?.name} — {booking.slot?.slot_number}</TableCell>
                                <TableCell className="font-mono font-semibold">{booking.vehicle?.plate_number}</TableCell>
                                <TableCell>{new Date(booking.arrival_time).toLocaleString()}</TableCell>
                                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState 
                    title="No Booking History" 
                    description="You have not created any parking slot reservations yet."
                />
            )}
        </div>
    );
};
