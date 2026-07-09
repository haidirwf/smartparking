import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { Car, Trash2, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

export const MyVehicles: React.FC = () => {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [plateNumber, setPlateNumber] = React.useState('');
    const [vehicleType, setVehicleType] = React.useState<'car' | 'motorcycle' | 'handicap'>('car');
    const [error, setError] = React.useState<string | null>(null);

    // Fetch Vehicles
    const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
        queryKey: ['myVehicles'],
        queryFn: async () => {
            const res = await api.get<Vehicle[]>(API_ENDPOINTS.VEHICLES);
            return res.data;
        }
    });

    // Add Vehicle Mutation
    const addMutation = useMutation({
        mutationFn: async (payload: { plate_number: string; vehicle_type: string }) => {
            const res = await api.post(API_ENDPOINTS.VEHICLES, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            setIsAddOpen(false);
            setPlateNumber('');
            setVehicleType('car');
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to add vehicle.');
        }
    });

    // Delete Vehicle Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`${API_ENDPOINTS.VEHICLES}/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
        }
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plateNumber.trim()) return;
        addMutation.mutate({
            plate_number: plateNumber,
            vehicle_type: vehicleType,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this vehicle?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-custom">My Vehicles</h1>
                    <p className="text-sm text-text-secondary">Register and manage license plates linked to your account.</p>
                </div>
                <Button className="rounded-xl flex items-center gap-1.5" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : vehicles && vehicles.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Vehicle Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell className="font-mono font-semibold">{v.plate_number}</TableCell>
                                <TableCell className="capitalize">{v.vehicle_type}</TableCell>
                                <TableCell>
                                    <Badge variant="success">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-danger-custom hover:bg-red-50 hover:text-red-600 rounded-xl"
                                        onClick={() => handleDelete(v.id)}
                                    >
                                        <Trash2 className="h-4.5 w-4.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState 
                    title="No Vehicles Registered" 
                    description="You must register a vehicle license plate before you can book a parking slot."
                    actionLabel="Register Your First Vehicle"
                    onAction={() => setIsAddOpen(true)}
                />
            )}

            {/* Add Vehicle Dialog */}
            <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
                <form onSubmit={handleAdd} className="space-y-4">
                    <h2 className="text-lg font-bold text-text-custom">Register Vehicle</h2>
                    
                    {error && (
                        <div className="rounded-xl bg-danger-custom/10 p-3 text-xs font-semibold text-danger-custom border border-danger-custom/25">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="plate">Plate Number</Label>
                        <Input 
                            id="plate" 
                            placeholder="e.g. B 1234 XYZ" 
                            value={plateNumber} 
                            onChange={(e) => setPlateNumber(e.target.value)} 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="type">Vehicle Type</Label>
                        <select
                            id="type"
                            className="flex h-11 w-full rounded-xl border border-border-custom bg-white px-3.5 text-sm text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value as any)}
                        >
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="handicap">Handicap Accessible</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={addMutation.isPending}>
                            {addMutation.isPending ? 'Registering...' : 'Register'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};
