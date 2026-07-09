import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS, SLOT_STATUS } from '@/constants';
import { ParkingArea, ParkingSlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/feedback';
import { Label } from '@/components/ui/label';

export const Slots: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedAreaId, setSelectedAreaId] = React.useState<string>('');

    // Fetch Areas
    const { data: areas, isLoading, error, refetch } = useQuery<ParkingArea[]>({
        queryKey: ['parkingAreasAdmin'],
        queryFn: async () => {
            const res = await api.get<ParkingArea[]>(API_ENDPOINTS.AREAS);
            return res.data;
        }
    });

    React.useEffect(() => {
        if (areas && areas.length > 0 && !selectedAreaId) {
            setSelectedAreaId(areas[0].id);
        }
    }, [areas, selectedAreaId]);

    const activeArea = areas?.find((a) => a.id === selectedAreaId);

    // Slot status update mutation
    const updateSlotMutation = useMutation({
        mutationFn: async ({ slotId, payload }: { slotId: string; payload: { status: string } }) => {
            const res = await api.put(`/api/admin/slots/${slotId}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingAreasAdmin'] });
        }
    });

    const toggleMaintenance = (slot: ParkingSlot) => {
        const nextStatus = slot.status === SLOT_STATUS.MAINTENANCE ? SLOT_STATUS.AVAILABLE : SLOT_STATUS.MAINTENANCE;
        updateSlotMutation.mutate({
            slotId: slot.id,
            payload: { status: nextStatus }
        });
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-custom">Manage Parking Slots</h1>
                    <p className="text-sm text-text-secondary">Configure structural parking areas, floors, and toggles.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* Sidebar area selectors */}
                <div className="md:col-span-1 space-y-2">
                    <Label className="text-xs uppercase font-semibold text-text-secondary">Select Area</Label>
                    {areas?.map((area) => (
                        <button
                            key={area.id}
                            onClick={() => setSelectedAreaId(area.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                                selectedAreaId === area.id
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border-custom bg-white text-text-custom hover:bg-gray-50'
                            }`}
                        >
                            {area.name} ({area.code})
                        </button>
                    ))}
                </div>

                {/* Main slots grid status table */}
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Slots Inventory</CardTitle>
                            <CardDescription>
                                Active floors and bays registered under {activeArea?.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {activeArea?.floors?.map((floor) => (
                                <div key={floor.id} className="space-y-3">
                                    <h3 className="text-sm font-bold text-text-custom border-b pb-1">
                                        {floor.name} (Level {floor.level})
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Slot Number</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Current Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {floor.slots?.map((slot) => (
                                                <TableRow key={slot.id}>
                                                    <TableCell className="font-semibold">{slot.slot_number}</TableCell>
                                                    <TableCell className="capitalize">{slot.slot_type}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                slot.status === 'available'
                                                                    ? 'success'
                                                                    : slot.status === 'maintenance'
                                                                    ? 'warning'
                                                                    : slot.status === 'occupied'
                                                                    ? 'danger'
                                                                    : 'outline'
                                                            }
                                                            className="capitalize"
                                                        >
                                                            {slot.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant={slot.status === 'maintenance' ? 'primary' : 'outline'}
                                                            className="rounded-xl"
                                                            onClick={() => toggleMaintenance(slot)}
                                                        >
                                                            {slot.status === 'maintenance' ? 'Re-enable' : 'Maintenance'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
