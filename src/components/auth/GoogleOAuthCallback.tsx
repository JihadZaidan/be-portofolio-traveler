import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const user = urlParams.get('user');
            const action = urlParams.get('action');
            const loginPage = urlParams.get('login_page');
            const error = urlParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                alert('Google OAuth failed. Please try again.');
                navigate('/');
                return;
            }

            if (token && user) {
                try {
                    const userData = JSON.parse(decodeURIComponent(user));
                    
                    // Store authentication data
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userEmail', userData.email);
                    localStorage.setItem('userName', userData.displayName || userData.username);
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('authProvider', 'google');
                    
                    // Store Google profile photo if available
                    if (userData.photoUrl || userData.picture) {
                        localStorage.setItem('userAvatarUrl', userData.photoUrl || userData.picture);
                    }
                    
                    // Dispatch auth change event
                    window.dispatchEvent(new Event('auth:changed'));
                    
                    // Show appropriate message based on action
                    if (action === 'signup') {
                        alert('🎉 Welcome to Travello! Your Google account has been successfully registered.');
                    } else if (action === 'login') {
                        alert('👋 Welcome back! Successfully signed in with Google.');
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
                console.error('Missing token or user data');
                navigate('/');
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                    {new URLSearchParams(window.location.search).get('action') === 'signup' 
                        ? '🚀 Creating your account with Google...' 
                        : '🔐 Signing you in with Google...'}
                </p>
            </div>
        </div>
    );
};

export default GoogleOAuthCallback;
