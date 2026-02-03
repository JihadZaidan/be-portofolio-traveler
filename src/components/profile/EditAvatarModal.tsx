import React, { useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';

type AreaPixels = { x: number; y: number; width: number; height: number };

export type EditAvatarModalProps = {
    open: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onSave: (avatarDataUrl: string) => void;
};

const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ open, imageSrc, onClose, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<AreaPixels | null>(null);

    const canShow = open && !!imageSrc;

    const zoomLabel = useMemo(() => {
        return `${zoom.toFixed(2)}x`;
    }, [zoom]);

    const createImage = (src: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (err) => reject(err));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = src;
        });
    };

    const getCroppedAvatar = async (src: string, area: AreaPixels) => {
        const image = await createImage(src);
        const size = Math.max(1, Math.floor(Math.min(area.width, area.height)));
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
        ctx.restore();

        return canvas.toDataURL('image/png');
    };

    const handleSave = async () => {
        if (!imageSrc) return;
        if (!croppedAreaPixels) return;
        const cropped = await getCroppedAvatar(imageSrc, croppedAreaPixels);
        if (!cropped) return;
        onSave(cropped);
    };

    if (!canShow) return null;

    return (
        <div className="fixed inset-0 z-[120]">
            <div className="absolute inset-0 bg-black/60" onMouseDown={onClose} />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-xl rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">Edit Photo</p>
                        <p className="mt-1 text-xs text-slate-500">Drag to reposition and use the slider to zoom.</p>
                    </div>

                    <div className="relative h-[360px] bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                        />
                    </div>

                    <div className="px-6 py-5 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-medium text-slate-700">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-xs text-slate-500 w-10 text-right">{zoomLabel}</span>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAvatarModal;
