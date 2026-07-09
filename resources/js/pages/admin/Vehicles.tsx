import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/feedback';

export const Vehicles: React.FC = () => {
    // Fetch all vehicles
    const { data: vehicles, isLoading, error, refetch } = useQuery<Vehicle[]>({
        queryKey: ['adminVehicles'],
        queryFn: async () => {
            const res = await api.get<Vehicle[]>('/api/vehicles'); // Normally handles global list, we fetch user's mock lists for now
            return res.data;
        }
    });

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
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">Vehicle Registry</h1>
                <p className="text-sm text-text-secondary">Overview of all active license plates registered in the system.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Vehicles</CardTitle>
                    <CardDescription>Track vehicle types and ownership mappings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plate Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles?.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-mono font-semibold">{vehicle.plate_number}</TableCell>
                                    <TableCell className="capitalize">{vehicle.vehicle_type}</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Active</Badge>
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
