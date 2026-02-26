import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Eye, EyeOff, Camera } from 'lucide-react';

export type AuthMode = 'signup' | 'login';

export type AuthModalProps = {
    open: boolean;
    mode?: AuthMode;
    closable?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
};

const AuthModal: React.FC<AuthModalProps> = ({
    open,
    mode = 'signup',
    closable = true,
    onClose,
    onSuccess,
}) => {
    const [overrideMode, setOverrideMode] = useState<AuthMode | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [signupStep, setSignupStep] = useState<'account' | 'profile'>('account');

    const activeMode: AuthMode = overrideMode ?? mode;

    useEffect(() => {
        if (!open) return;
        if (!closable) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose?.();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, closable, onClose]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const title = useMemo(() => {
        if (activeMode === 'signup') {
            return signupStep === 'profile' ? 'Your Profile' : 'Sign Up Account';
        }
        return 'Log In';
    }, [activeMode, signupStep]);

    const subtitle = useMemo(() => {
        return activeMode === 'signup'
            ? 'Complete these easy steps to register your account.'
            : 'Please log in to continue.';
    }, [activeMode]);

    const handleBackdropClick = () => {
        if (!closable) return;
        setOverrideMode(null);
        setSignupStep('account');
        onClose?.();
    };

    const handleClose = () => {
        if (!closable) return;
        setOverrideMode(null);
        setSignupStep('account');
        onClose?.();
    };

    const completeAuth = () => {
        const normalizedEmail = (email || '').trim();
        const fullName = `${firstName} ${lastName}`.trim();
        localStorage.setItem('isAuthenticated', 'true');
        if (normalizedEmail) localStorage.setItem('userEmail', normalizedEmail);
        if (fullName) localStorage.setItem('userName', fullName);
        if (avatarUrl) localStorage.setItem('userAvatarUrl', avatarUrl);
        localStorage.setItem('authProvider', 'local');
        window.dispatchEvent(new Event('auth:changed'));
        setOverrideMode(null);
        setSignupStep('account');
        onSuccess?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedEmail = (email || '').trim();
        const normalizedPassword = (password || '').trim();
        const normalizedFirstName = (firstName || '').trim();
        const normalizedLastName = (lastName || '').trim();

        if (activeMode === 'signup') {
            if (signupStep === 'account') {
                if (!normalizedFirstName) return;
                if (!normalizedLastName) return;
                if (!normalizedEmail) return;
                if (!normalizedPassword) return;
                setSignupStep('profile');
                return;
            }
            if (!normalizedEmail) return;
        }

        if (activeMode === 'login') {
            if (!normalizedEmail) return;
            if (!normalizedPassword) return;
        }

        // Call backend API instead of local auth
        handleBackendAuth();
    };

    const handleBackendAuth = async () => {
        const normalizedEmail = (email || '').trim();
        const normalizedPassword = (password || '').trim();
        const normalizedFirstName = (firstName || '').trim();
        const normalizedLastName = (lastName || '').trim();
        const isSignup = activeMode === 'signup';

        try {
            // Get current page context to determine login_page
            const currentPath = window.location.pathname;
            let loginPage = 'default';
            
            if (currentPath.includes('/ai-chatbot')) {
                loginPage = 'aichatbot';
            } else if (currentPath.includes('/shop')) {
                loginPage = 'shop';
            } else if (currentPath.includes('/admin')) {
                loginPage = 'admin';
            }

            // Prepare form data
            const formData = {
                email: normalizedEmail,
                ...(isSignup && {
                    username: `${normalizedFirstName.toLowerCase()}${normalizedLastName.toLowerCase()}`,
                    displayName: `${normalizedFirstName} ${normalizedLastName}`.trim(),
                    password: normalizedPassword
                }),
                ...(!isSignup && {
                    password: normalizedPassword
                })
            };

            // Determine API endpoint
            const endpoint = isSignup ? 'register' : 'login';
            const apiUrl = `http://localhost:5000/api/auth/${endpoint}?login_page=${loginPage}`;

            // Make API call
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Store authentication data
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userEmail', result.data.user.email);
                localStorage.setItem('userName', result.data.user.displayName || result.data.user.username);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('authProvider', 'manual');
                
                if (result.data.user.profilePicture) {
                    localStorage.setItem('userAvatarUrl', result.data.user.profilePicture);
                }
                
                // Dispatch auth change event
                window.dispatchEvent(new Event('auth:changed'));
                
                // Show success message
                if (isSignup) {
                    alert('🎉 Welcome to Travello! Your account has been successfully created.');
                } else {
                    alert('👋 Welcome back! Successfully signed in.');
                }
                
                // Redirect based on login_page
                if (loginPage === 'aichatbot') {
                    window.location.href = '/ai-chatbot';
                } else if (loginPage === 'shop') {
                    window.location.href = '/shop';
                } else if (loginPage === 'admin') {
                    window.location.href = '/admin/users';
                } else {
                    // Default redirect to admin users page
                    window.location.href = '/admin/users';
                }
                
                onSuccess?.();
            } else {
                alert('Authentication failed: ' + result.message);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Authentication failed. Please try again.');
        }
    };

    const handleProviderClick = async () => {
        try {
            // Determine if this is signup or login mode
            const isSignup = activeMode === 'signup';
            
            // Get current page context to determine login_page
            const currentPath = window.location.pathname;
            let loginPage = 'default';
            
            if (currentPath.includes('/ai-chatbot')) {
                loginPage = 'aichatbot';
            } else if (currentPath.includes('/shop')) {
                loginPage = 'shop';
            } else if (currentPath.includes('/admin')) {
                loginPage = 'admin';
            }
            
            // Redirect to Google OAuth endpoint with mode and login_page parameters
            const googleOAuthUrl = `http://localhost:5000/api/auth/google?mode=${isSignup ? 'signup' : 'login'}&login_page=${loginPage}`;
            window.location.href = googleOAuthUrl;
        } catch (error) {
            console.error('Google OAuth error:', error);
            // Fallback to manual auth
            completeAuth();
        }
    };

    const handleAvatarButtonClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAvatarUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            <div
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                onMouseDown={handleBackdropClick}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] grid grid-cols-1 md:grid-cols-2">
                    <div
                        className="relative overflow-hidden px-10 py-10 md:py-14 flex flex-col justify-center"
                        style={{
                            backgroundImage: "url('/bg-signup-login.png')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'start',
                        }}
                    >

                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -right-24 bottom-[-120px] h-72 w-72 rounded-full bg-white/10 blur-2xl" />

                        <h2 className="relative text-3xl md:text-4xl font-semibold tracking-tight text-white text-center">
                            Get Started with Me
                        </h2>
                        <p className="relative mt-4 max-w-sm text-sm md:text-base text-white/80 text-center mx-auto">
                            {subtitle}
                        </p>

                        <div className="relative mt-10 space-y-4">
                            <div
                                className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${
                                    activeMode === 'signup' && signupStep === 'account'
                                        ? 'bg-white/12'
                                        : 'bg-white/8'
                                }`}
                            >
                                <div
                                    className={`h-8 w-8 rounded-full font-semibold text-sm flex items-center justify-center ${
                                        activeMode === 'signup' && signupStep === 'account'
                                            ? 'bg-white text-[#0b2c8f]'
                                            : 'bg-white/15 text-white'
                                    }`}
                                >
                                    1
                                </div>
                                <p
                                    className={`text-sm font-medium ${
                                        activeMode === 'signup' && signupStep === 'account'
                                            ? 'text-white'
                                            : 'text-white/70'
                                    }`}
                                >
                                    {activeMode === 'signup' ? 'Sign up your account' : 'Log in to your account'}
                                </p>
                            </div>
                            {activeMode === 'signup' && (
                                <div
                                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${
                                        signupStep === 'profile' ? 'bg-white/12' : 'bg-white/8'
                                    }`}
                                >
                                    <div
                                        className={`h-8 w-8 rounded-full font-semibold text-sm flex items-center justify-center ${
                                            signupStep === 'profile'
                                                ? 'bg-white text-[#0b2c8f]'
                                                : 'bg-white/15 text-white'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <p
                                        className={`text-sm ${
                                            signupStep === 'profile' ? 'text-white' : 'text-white/70'
                                        }`}
                                    >
                                        Set up your profile
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative px-8 py-10 md:px-10 md:py-14">
                        {closable && (
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close"
                                className="absolute right-5 top-5 h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}

                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                        </div>

                        {!(activeMode === 'signup' && signupStep === 'profile') && (
                            <>
                                <div className="mt-6 w-full">
                                    <button
                                        type="button"
                                        onClick={handleProviderClick}
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700"
                                    >
                                        <span className="inline-flex items-center justify-center">
                                            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.695 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.003 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.186 35.091 26.715 36 24 36c-5.202 0-9.665-3.317-11.277-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.781 2.195-2.195 4.069-4.085 5.565l-.003-.002 6.191 5.238C36.973 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                            </svg>
                                        </span>
                                        Google
                                    </button>
                                </div>

                                <div className="mt-6 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-xs text-slate-400">Or</span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>
                            </>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            {activeMode === 'signup' && signupStep === 'account' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                                placeholder="eg. Farras"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                                placeholder="eg. Prayugo"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                            placeholder="eg. fdeewyy@gmail.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Password</label>
                                        <div className="relative mt-2">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                                aria-label="Toggle password"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[11px] text-slate-500">Must be at least 8 characters.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-2 w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                                    >
                                        Continue
                                    </button>
                                </>
                            )}

                            {/* Profile */}

                            {activeMode === 'signup' && signupStep === 'profile' && (
                                <>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative h-32 w-32 flex items-center justify-center">
                                            <div className="h-32 w-32 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 text-xl font-semibold">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt="Profile avatar"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>
                                                        {(firstName || lastName)
                                                            ? `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase()
                                                            : 'PP'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAvatarButtonClick}
                                                className="absolute bottom-6 right-6 translate-x-1/2 translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md"
                                                aria-label="Edit profile picture"
                                            >
                                                <Camera className="h-4.5 w-4.5" />
                                            </button>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </div>

                                        <div className="w-full space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                                                <div className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-900">
                                                    {(firstName || lastName)
                                                        ? `${firstName} ${lastName}`.trim()
                                                        : 'Your name'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700">Email</label>
                                                <div className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-900">
                                                    {email || 'your@email.com'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-4 w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}

                            {activeMode === 'login' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                            placeholder="eg. fdeewyy@gmail.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Password</label>
                                        <div className="relative mt-2">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                                                aria-label="Toggle password"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[11px] text-slate-500">Must be at least 8 characters.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-2 w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                                    >
                                        Log In
                                    </button>
                                </>
                            )}
                        </form>

                        <div className="mt-6 text-center text-xs text-slate-500">
                            {activeMode === 'signup' ? (
                                <>
                                    Already have an account?
                                    <button
                                        type="button"
                                        onClick={() => setOverrideMode('login')}
                                        className="ml-1 font-semibold text-slate-900"
                                    >
                                        Log in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don't have an account?
                                    <button
                                        type="button"
                                        onClick={() => setOverrideMode('signup')}
                                        className="ml-1 font-semibold text-slate-900"
                                    >
                                        Sign up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
