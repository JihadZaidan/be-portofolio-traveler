import React, { useState } from 'react';
import { X } from 'lucide-react';

export type SignUpNotificationProps = {
    message?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
};

const SignUpNotification: React.FC<SignUpNotificationProps> = ({
    message = 'Sign up off to your first order.',
    ctaLabel = 'Sign Up Now',
    onCtaClick,
}) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="w-full bg-[#111c55] text-white text-[11px] md:text-xs">
            <div className="mx-auto max-w-7xl px-4 flex items-center justify-center py-2 relative">
                <p className="text-center text-white/90">
                    {message}{' '}
                    <button
                        type="button"
                        onClick={onCtaClick}
                        className="font-medium underline underline-offset-2 hover:text-white"
                    >
                        {ctaLabel}
                    </button>
                </p>

                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Close notification"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};

export default SignUpNotification;
