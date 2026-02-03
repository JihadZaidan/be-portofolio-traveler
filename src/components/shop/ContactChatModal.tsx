import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ChatContainer from '../AIchatbot/ChatContainer';

export type ContactChatModalProps = {
    open: boolean;
    onClose: () => void;
};

const ContactChatModal: React.FC<ContactChatModalProps> = ({ open, onClose }) => {
    const [position, setPosition] = useState<{ top: number; right: number }>({ top: 64, right: 24 });
    const dragState = useRef<{ dragging: boolean; startX: number; startY: number; startTop: number; startRight: number } | null>(
        null,
    );

    const handleMouseDownHeader = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startTop: position.top,
            startRight: position.right,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.current || !dragState.current.dragging) return;
        const { startX, startY, startTop, startRight } = dragState.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        setPosition({
            top: Math.max(16, startTop + deltaY),
            right: Math.max(16, startRight - deltaX),
        });
    }, [setPosition]);

    const handleMouseUp = useCallback(() => {
        if (dragState.current) {
            dragState.current.dragging = false;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20">
            <div
                className="absolute w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
                style={{ top: position.top, right: position.right }}
            >
                <header
                    className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white cursor-move select-none"
                    onMouseDown={handleMouseDownHeader}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200">
                            <img
                                src="/rizwords-nomad.jpg"
                                alt="Rizqi Maulana"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Message Rizqi</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                        aria-label="Close contact chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="h-[480px] border-t border-slate-200 bg-white">
                    <ChatContainer
                        showActions={false}
                        showHeader={false}
                        senderRole="user"
                        chatMode="cs"
                        theme="light"
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactChatModal;
