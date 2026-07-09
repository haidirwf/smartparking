import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { API_ENDPOINTS, ROUTES, SLOT_STATUS } from '@/constants';
import { ParkingArea, ParkingSlot, Vehicle, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/feedback';
import { Car, CheckCircle, Info, Calendar, QrCode } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

export const NewBooking: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // 1. Local Selection State
    const [selectedAreaId, setSelectedAreaId] = React.useState<string>('');
    const [selectedFloorId, setSelectedFloorId] = React.useState<string>('');
    const [selectedSlot, setSelectedSlot] = React.useState<ParkingSlot | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = React.useState<string>('');
    const [arrivalTime, setArrivalTime] = React.useState<string>(() => {
        // Default to now + 5 minutes, formatted as Y-m-d H:i:s
        const date = new Date();
        date.setMinutes(date.getMinutes() + 5);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    });
    
    // Dialog and success states
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [successBooking, setSuccessBooking] = React.useState<Booking | null>(null);

    // 2. Fetch Active Booking, Areas and Vehicles
    const { data: activeBooking, isLoading: isLoadingActive } = useQuery<Booking | null>({
        queryKey: ['activeBooking'],
        queryFn: async () => {
            const res = await api.get<Booking | null>(API_ENDPOINTS.BOOKINGS + '/active');
            return res.data;
        },
    });

    const { data: areas, isLoading: isLoadingAreas, error: areasError, refetch: refetchAreas } = useQuery<ParkingArea[]>({
        queryKey: ['parkingAreas'],
        queryFn: async () => {
            const res = await api.get<ParkingArea[]>(API_ENDPOINTS.AREAS);
            return res.data;
        },
        enabled: !activeBooking,
    });

    const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
        queryKey: ['myVehicles'],
        queryFn: async () => {
            const res = await api.get<Vehicle[]>(API_ENDPOINTS.VEHICLES);
            return res.data;
        },
        enabled: !activeBooking,
    });

    // 3. Set default selections when data loads
    React.useEffect(() => {
        if (areas && areas.length > 0 && !selectedAreaId) {
            setSelectedAreaId(areas[0].id);
        }
    }, [areas, selectedAreaId]);

    const activeArea = areas?.find(a => a.id === selectedAreaId);

    React.useEffect(() => {
        if (activeArea && activeArea.floors && activeArea.floors.length > 0) {
            setSelectedFloorId(activeArea.floors[0].id);
        }
    }, [activeArea]);

    React.useEffect(() => {
        if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
            setSelectedVehicleId(vehicles[0].id);
        }
    }, [vehicles, selectedVehicleId]);

    const activeFloor = activeArea?.floors?.find(f => f.id === selectedFloorId);

    // 4. Create Booking Mutation
    const bookingMutation = useMutation({
        mutationFn: async (payload: { parking_slot_id: string; vehicle_id: string; arrival_time: string }) => {
            const res = await api.post<{ message: string; booking: Booking }>(API_ENDPOINTS.BOOKINGS, payload);
            return res.data.booking;
        },
        onSuccess: (newBooking) => {
            queryClient.invalidateQueries({ queryKey: ['activeBooking'] });
            queryClient.invalidateQueries({ queryKey: ['parkingAreas'] });
            setSuccessBooking(newBooking);
            setIsConfirmOpen(false);
        },
    });

    const handleConfirmBooking = () => {
        if (!selectedSlot || !selectedVehicleId || !arrivalTime) return;
        bookingMutation.mutate({
            parking_slot_id: selectedSlot.id,
            vehicle_id: selectedVehicleId,
            arrival_time: arrivalTime,
        });
    };

    // If page is checking for active booking
    if (isLoadingActive || isLoadingAreas || isLoadingVehicles) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    // If user already has an active session/booking
    if (activeBooking) {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <Card className="border border-primary/20">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
                            <CheckCircle className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <CardTitle className="text-xl">Active Booking Found</CardTitle>
                        <CardDescription>You currently have a reservation or active session.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Slot Number:</span>
                            <span className="font-semibold">{activeBooking.slot?.slot_number}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Vehicle Plate:</span>
                            <span className="font-mono font-semibold">{activeBooking.vehicle?.plate_number}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Status:</span>
                            <Badge variant={activeBooking.status === 'active' ? 'success' : 'warning'} className="capitalize">
                                {activeBooking.status}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">QR Token:</span>
                            <span className="font-mono text-xs font-semibold bg-gray-50 px-2 py-1 rounded border">{activeBooking.qr_code}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 border border-[#E5E7EB] rounded-2xl bg-gray-50 mt-4">
                            <div className="h-40 w-40 flex items-center justify-center border bg-white rounded-xl shadow-inner mb-3">
                                <QrCode className="h-28 w-28 text-text-custom" />
                            </div>
                            <span className="text-[10px] text-text-secondary">Scan this code at the gate</span>
                        </div>
                        
                        <Button 
                            className="w-full mt-4" 
                            variant="secondary"
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (areasError) {
        return <ErrorState onRetry={refetchAreas} />;
    }

    // Success booking card
    if (successBooking) {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <Card className="border-2 border-primary/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success-custom/10 text-success-custom border border-success-custom/25 mb-4">
                            <CheckCircle className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
                        <CardDescription>Your slot has been reserved successfully.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Location:</span>
                            <span className="font-semibold text-right">{successBooking.slot?.floor?.area?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Floor / Slot:</span>
                            <span className="font-semibold">{successBooking.slot?.floor?.name} — {successBooking.slot?.slot_number}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#6B7280]">Vehicle:</span>
                            <span className="font-mono font-semibold">{successBooking.vehicle?.plate_number}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 border border-[#E5E7EB] rounded-2xl bg-[#FAFAFA] mt-4">
                            <div className="h-40 w-40 flex items-center justify-center border bg-white rounded-xl shadow-inner mb-3">
                                <QrCode className="h-28 w-28 text-primary" />
                            </div>
                            <span className="font-mono font-semibold text-sm mb-1">{successBooking.qr_code}</span>
                            <span className="text-[10px] text-text-secondary">Scan code upon arrival</span>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                            <Button 
                                className="flex-1" 
                                variant="outline"
                                onClick={() => {
                                    setSuccessBooking(null);
                                    setSelectedSlot(null);
                                }}
                            >
                                Book Another
                            </Button>
                            <Button 
                                className="flex-1"
                                onClick={() => navigate(ROUTES.DASHBOARD)}
                            >
                                Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!vehicles || vehicles.length === 0) {
        return (
            <EmptyState
                title="No Registered Vehicles"
                description="You must register at least one vehicle to your account before reserving a slot."
                actionLabel="Register Vehicle"
                onAction={() => navigate(ROUTES.VEHICLES)}
            />
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Left/Middle Column: Interactive Grid Selector */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Location & Floor</CardTitle>
                        <CardDescription>Choose a building area and floor to view available slots.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="area">Parking Area</Label>
                                <select
                                    id="area"
                                    className="flex h-11 w-full rounded-xl border border-border-custom bg-white px-3.5 text-sm text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={selectedAreaId}
                                    onChange={(e) => {
                                        setSelectedAreaId(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    {areas?.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name} ({area.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="floor">Floor Level</Label>
                                <select
                                    id="floor"
                                    className="flex h-11 w-full rounded-xl border border-border-custom bg-white px-3.5 text-sm text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={selectedFloorId}
                                    onChange={(e) => {
                                        setSelectedFloorId(e.target.value);
                                        setSelectedSlot(null);
                                    }}
                                    disabled={!activeArea}
                                >
                                    {activeArea?.floors?.map((floor) => (
                                        <option key={floor.id} value={floor.id}>
                                            {floor.name} (Level {floor.level})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Grid Visualizer */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle>Interactive Map</CardTitle>
                            <CardDescription>Click on an available slot to book.</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-gray-100 border" />
                                <span className="text-[#6B7280]">Available</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-primary/20 border border-primary/30" />
                                <span className="text-[#6B7280]">Reserved</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-danger-custom/20 border border-danger-custom/30" />
                                <span className="text-[#6B7280]">Occupied</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-warning-custom/20 border border-warning-custom/30" />
                                <span className="text-[#6B7280]">Maintenance</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeFloor?.slots && activeFloor.slots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {activeFloor.slots.map((slot) => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    const isAvailable = slot.status === 'available';
                                    
                                    // Set styles according to status
                                    let statusClasses = 'bg-white border-border-custom hover:border-primary text-text-custom cursor-pointer';
                                    if (slot.status === 'occupied') {
                                        statusClasses = 'bg-danger-custom/5 border-danger-custom/10 text-danger-custom pointer-events-none opacity-60';
                                    } else if (slot.status === 'reserved') {
                                        statusClasses = 'bg-primary/5 border-primary/10 text-primary pointer-events-none opacity-60';
                                    } else if (slot.status === 'maintenance') {
                                        statusClasses = 'bg-warning-custom/5 border-warning-custom/10 text-warning-custom pointer-events-none opacity-60';
                                    }

                                    if (isSelected) {
                                        statusClasses = 'ring-2 ring-primary border-primary bg-primary/5';
                                    }

                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${statusClasses}`}
                                        >
                                            <span className="font-semibold text-sm">{slot.slot_number}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">
                                                {slot.slot_type}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title="No slots available"
                                description="No parking slots registered on this floor yet."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Checkout Sidebar Panel */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Reservation Details</CardTitle>
                        <CardDescription>Review and confirm your booking parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="vehicle">Select Vehicle</Label>
                            <select
                                id="vehicle"
                                className="flex h-11 w-full rounded-xl border border-border-custom bg-white px-3.5 text-sm text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                                value={selectedVehicleId}
                                onChange={(e) => setSelectedVehicleId(e.target.value)}
                            >
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.plate_number} ({v.vehicle_type.toUpperCase()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="arrival">Planned Arrival Time</Label>
                            <input
                                id="arrival"
                                type="text"
                                className="flex h-11 w-full rounded-xl border border-border-custom bg-white px-3.5 text-sm text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="YYYY-MM-DD HH:MM:SS"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                            />
                            <p className="text-[10px] text-text-secondary flex items-start gap-1">
                                <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
                                Slot is held for 30 minutes from your arrival target.
                            </p>
                        </div>

                        <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Area:</span>
                                <span className="font-semibold">{activeArea?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Floor:</span>
                                <span className="font-semibold">{activeFloor?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Selected Slot:</span>
                                <span className="font-semibold text-primary">{selectedSlot?.slot_number || 'None'}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 mt-2"
                            disabled={!selectedSlot || !selectedVehicleId || !arrivalTime}
                            onClick={() => setIsConfirmOpen(true)}
                        >
                            Request Reservation
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-text-custom flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Confirm Reservation
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Are you sure you want to reserve slot <strong className="text-text-custom">{selectedSlot?.slot_number}</strong>? 
                        Once confirmed, your booking QR will be generated and you will have 30 minutes to check in at the gate.
                    </p>
                    <div className="flex justify-end gap-3 pt-3 border-t">
                        <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleConfirmBooking} disabled={bookingMutation.isPending}>
                            {bookingMutation.isPending ? 'Confirming...' : 'Yes, Confirm'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
