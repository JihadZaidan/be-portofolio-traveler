import React, { useEffect, useState } from 'react';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showFallback?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md', 
  className = '', 
  showFallback = true 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [authProvider, setAuthProvider] = useState<string>('');

  useEffect(() => {
    // Get user data from localStorage
    const storedAvatar = localStorage.getItem('userAvatarUrl');
    const storedName = localStorage.getItem('userName') || '';
    const storedProvider = localStorage.getItem('authProvider') || '';
    
    setUserName(storedName);
    setAuthProvider(storedProvider);
    
    // Set avatar URL based on provider
    if (storedAvatar && storedProvider === 'google') {
      // For Google users, use the Google profile picture
      setAvatarUrl(storedAvatar);
    } else if (storedAvatar && storedProvider === 'manual') {
      // For manual users, use uploaded profile picture
      setAvatarUrl(storedAvatar);
    } else if (storedProvider === 'google') {
      // For Google users without photo, use default Google avatar
      const googleAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName)}&background=4285f4&color=fff&size=128&bold=true&format=png`;
      setAvatarUrl(googleAvatarUrl);
    } else {
      // For manual users without photo, use generic avatar
      const genericAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName)}&background=64748b&color=fff&size=128&bold=true&format=png`;
      setAvatarUrl(genericAvatarUrl);
    }
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!avatarUrl && !userName) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gray-200 flex items-center justify-center`}>
        <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userName || 'User avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Fallback to initials */}
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${
          authProvider === 'google' 
            ? 'bg-blue-500' 
            : 'bg-gray-500'
        }`}
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {getInitials(userName)}
      </div>
      
      {/* Provider indicator */}
      {showFallback && authProvider && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-white">
          {authProvider === 'google' ? (
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
