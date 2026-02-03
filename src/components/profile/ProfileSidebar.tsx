import React, { useRef } from 'react';
import { Camera, Hash, LogOut, Mail } from 'lucide-react';

type UserProfile = {
    name: string;
    email: string;
    password: string;
    avatarUrl: string;
};

export type ProfileSidebarProps = {
    profile: UserProfile;
    onPickAvatar: (imageSrc: string) => void;
    onLogout: () => void;
};

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile, onPickAvatar, onLogout }) => {
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarButtonClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') return;
            onPickAvatar(reader.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col lg:h-full lg:col-start-2">
            <div className="p-7">
                <div className="flex flex-col items-center text-center">
                    <div className="relative h-24 w-24">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-200">
                            <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                        </div>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <button
                            type="button"
                            onClick={handleAvatarButtonClick}
                            className="absolute -bottom-1 -right-1 z-10 h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-white transition-colors flex items-center justify-center shadow-sm"
                            aria-label="Change profile photo"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">{profile.name}</p>
                </div>
            </div>

            <div className="h-px w-full bg-slate-200" />

            <div className="p-7 pt-6 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-5">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Mail className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold text-slate-900">Email</p>
                            <p className="text-xs text-slate-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Hash className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold text-slate-900">Password</p>
                            <p className="text-xs text-slate-500">********</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="w-full mt-2 h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
