import React from 'react';

interface ChatMessageProps {
    message: string;
    messageType?: 'text' | 'image';
    imageUrl?: string;
    role: 'user' | 'admin' | 'ai';
    name: string;
    avatar?: string;
    timestamp?: string;
    theme?: 'light' | 'dark';
    align?: 'left' | 'right';
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    messageType = 'text',
    imageUrl,
    role,
    name,
    avatar,
    timestamp,
    theme = 'light',
    align,
}) => {
    const isDark = theme === 'dark';
    const isUser = role === 'user';
    const isAdmin = role === 'admin';
    const isAI = role === 'ai';

    const isRightAligned = align
        ? align === 'right'
        : isUser;

    const defaultUserAvatar = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300';
    const defaultAdminAvatar = '/rizwords-nomad.jpg';
    const defaultAIAvatar = '/rizwords-nomad.jpg';

    const computedAvatar = avatar || (isUser ? defaultUserAvatar : isAdmin ? defaultAdminAvatar : defaultAIAvatar);

    return (
        <div className={`flex items-start gap-3 mb-4 ${isRightAligned ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'}`}>
                <img
                    src={computedAvatar}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className={`min-w-0 ${isRightAligned ? 'flex flex-col items-end' : 'flex flex-col items-start'} max-w-[78%]`}>
                <div className={`flex items-center gap-2 mb-1 ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{name}</span>
                    {isAdmin && (
                        <span className={`text-[10px] leading-none px-2 py-1 rounded-full ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                            Admin
                        </span>
                    )}
                    {timestamp && (
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{timestamp}</span>
                    )}
                </div>

                <div
                    className={
                        `inline-block max-w-full rounded-2xl px-4 py-3 shadow-sm border ` +
                        (isDark
                            ? (isUser
                                ? 'bg-slate-900/70 border-slate-800 text-slate-100 rounded-tr-md'
                                : isAI
                                    ? 'bg-slate-900/40 border-slate-800 text-slate-100'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-100')
                            : (isUser
                                ? 'bg-white border-gray-200 rounded-tr-md'
                                : isAI
                                    ? 'bg-gray-50 border-gray-100'
                                    : 'bg-white border-gray-100'))
                    }
                >
                    {messageType === 'image' && imageUrl ? (
                        <div className="w-full">
                            <img
                                src={imageUrl}
                                alt={message}
                                className="w-full max-w-[360px] rounded-2xl object-cover"
                            />
                        </div>
                    ) : (
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
