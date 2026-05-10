import React from 'react';
import { useGetHallByIdQuery, useRegenerateHallQrMutation } from '../../../store/api/hallApi';
import type { IHall } from '../../../types/hall';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface Props {
    hallId: string | null;
}

function campusLabel(campusId: IHall['campusId']): string {
    if (typeof campusId === 'object' && campusId !== null && 'campusName' in campusId) {
        return campusId.campusName;
    }
    return String(campusId);
}

const HallDetail: React.FC<Props> = ({ hallId }) => {
    const id = hallId ? String(hallId) : '';
    const { data: row, isLoading } = useGetHallByIdQuery(
        { id, params: { options: { populate: [{ path: 'campusId', select: 'campusName' }] } } },
        { skip: !id },
    );
    const [regenerateQr, { isLoading: isRegenerating }] = useRegenerateHallQrMutation();

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    const handleRegenerateQr = async () => {
        try {
            await regenerateQr(id).unwrap();
            toast.success('QR Code regenerated successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to regenerate QR code');
        }
    };

    return (
        <div className="space-y-3 text-sm">
            <h4 className="font-semibold">{row.name}</h4>
            <p className="text-gray-600 dark:text-gray-300">Code: {row.code}</p>
            <p className="text-gray-600 dark:text-gray-300">Campus: {campusLabel(row.campusId)}</p>
            {row.capacity != null ? <p className="text-gray-600 dark:text-gray-300">Capacity: {row.capacity}</p> : null}
            <p>Status: {row.status}</p>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <h5 className="font-semibold mb-2">Geofence Configuration</h5>
                {row.latitude && row.longitude ? (
                    <>
                        <p className="text-gray-600 dark:text-gray-300">Latitude: {row.latitude}</p>
                        <p className="text-gray-600 dark:text-gray-300">Longitude: {row.longitude}</p>
                        <p className="text-gray-600 dark:text-gray-300">Radius: {row.geofenceRadiusMeters || 50} meters</p>
                    </>
                ) : (
                    <p className="text-gray-400 italic">No geolocation set</p>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold">Classroom QR Code</h5>
                    <button 
                        onClick={handleRegenerateQr} 
                        disabled={isRegenerating}
                        className="btn btn-sm btn-outline-primary"
                    >
                        {isRegenerating ? 'Generating...' : 'Regenerate'}
                    </button>
                </div>
                {row.qrCodeToken ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-100 dark:border-gray-800">
                        <QRCodeSVG value={row.qrCodeToken} size={150} />
                        <p className="text-xs text-gray-400 mt-3 font-mono break-all text-center">{row.qrCodeToken}</p>
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No QR code available</p>
                )}
            </div>
        </div>
    );
};

export default HallDetail;
