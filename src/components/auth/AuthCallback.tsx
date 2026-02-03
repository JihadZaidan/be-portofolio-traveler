import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleAuthCallback = () => {
            const urlParams = new URLSearchParams(location.search);
            const token = urlParams.get('token');
            const user = urlParams.get('user');
            const action = urlParams.get('action');
            const auth = urlParams.get('auth');
            const loginPage = urlParams.get('login_page');

            if (auth === 'success' && token && user) {
                try {
                    const userData = JSON.parse(decodeURIComponent(user));
                    
                    // Store authentication data
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userEmail', userData.email);
                    localStorage.setItem('userName', userData.displayName || userData.username || userData.name);
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('authProvider', 'local');
                    
                    // Store additional user data if available
                    if (userData.profilePicture) {
                        localStorage.setItem('userAvatarUrl', userData.profilePicture);
                    }
                    
                    // Dispatch auth change event
                    window.dispatchEvent(new Event('auth:changed'));
                    
                    // Show appropriate message based on action
                    if (action === 'signup') {
                        alert('🎉 Welcome to Travello! Your account has been successfully created.');
                    } else if (action === 'login') {
                        alert('👋 Welcome back! Successfully signed in.');
                    }
                    
                    // Redirect based on login_page parameter
                    if (loginPage === 'aichatbot') {
                        navigate('/ai-chatbot');
                    } else if (loginPage === 'shop') {
                        navigate('/shop');
                    } else if (loginPage === 'admin') {
                        navigate('/admin/users');
                    } else {
                        // Default redirect to admin users page
                        navigate('/admin/users');
                    }
                    
                } catch (error) {
                    console.error('User data parsing error:', error);
                    alert('Authentication verification failed');
                    navigate('/');
                }
            } else {
                console.error('Missing authentication data');
                navigate('/');
            }
        };

        handleAuthCallback();
    }, [navigate, location.search]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                    Setting up your account...
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
