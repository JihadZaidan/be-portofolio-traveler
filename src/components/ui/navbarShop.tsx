import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from './button';

type NavbarShopProps = {
    onSignUpClick?: () => void;
};

const NavbarShop: React.FC<NavbarShopProps> = ({ onSignUpClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window === 'undefined') return;
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
            setUserEmail(localStorage.getItem('userEmail'));
            setUserAvatarUrl(localStorage.getItem('userAvatarUrl'));
        };

        checkAuth();

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'isAuthenticated' || event.key === 'userEmail' || event.key === 'userAvatarUrl') {
                checkAuth();
            }
        };

        const handleAuthChanged = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('auth:changed', handleAuthChanged);
        window.addEventListener('focus', checkAuth);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('auth:changed', handleAuthChanged);
            window.removeEventListener('focus', checkAuth);
        };
    }, []);

    return (
        <header className="w-full bg-white">
            <nav className="mx-auto flex max-w-7xl items-center gap-4 py-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="w-full h-11 rounded-full bg-gray-100 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-500 outline-none ring-1 ring-transparent focus:ring-gray-200"
                    />
                </div>

                <div className="hidden items-center gap-7 text-sm text-gray-700 md:flex">
                    <Link to="/work" className="hover:text-gray-900 transition-colors">Home</Link>
                    <Link
                        to="/blog?from=shop"
                        className={`hover:text-gray-900 transition-colors ${location.pathname === '/blog' ? 'text-gray-900' : ''}`}
                    >
                        Blog
                    </Link>
                    <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                    {!isAuthenticated ? (
                        <Button
                            variant="link"
                            className="px-0 text-gray-700 hover:text-gray-900"
                            onClick={() => {
                                if (onSignUpClick) {
                                    onSignUpClick();
                                } else {
                                    navigate('/ai-chatbot');
                                }
                            }}
                        >
                            Sign Up
                        </Button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-gray-200 hover:ring-gray-300 transition-colors"
                            aria-label="User profile"
                        >
                            {userAvatarUrl ? (
                                <img
                                    src={userAvatarUrl}
                                    alt={userEmail ? `Avatar ${userEmail}` : 'User avatar'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-700 text-sm font-semibold">
                                    {(() => {
                                        const base = (userEmail || 'U').trim();
                                        return base.slice(0, 1).toUpperCase();
                                    })()}
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default NavbarShop;
