import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageSquareText, Sun, Moon, Home, Plus, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatContainer, { type ChatContainerHandle, type Message } from '../../../components/AIchatbot/ChatContainer';
import ChatHistory from '../../../components/AIchatbot/ChatHistory';
import AuthModal from '../../../components/auth/AuthModal';
import UserAvatar from '../../../components/auth/UserAvatar';

const sampleHistoryItems = [
    { id: '1', title: 'How to get fit without doing an...', timestamp: '2m ago' },
    { id: '2', title: 'Hacking FBI Server with ras...', timestamp: '2m ago' },
    { id: '3', title: 'Compsci SICP Tutorial course', timestamp: '2m ago' },
    { id: '4', title: 'Proxy failure troubleshooting', timestamp: '2m ago' },
    { id: '5', title: 'Wake me up when september e...', timestamp: '2m ago' },
];

const initialChatId = sampleHistoryItems[0]?.id;

const initialChatMessages: Message[] = [
    {
        id: 'user-1',
        content: 'do androids truly dream of electric sheeps or not?',
        role: 'user',
        name: 'Farras',
        timestamp: '02:22 AM',
    },
    {
        id: 'ai-1',
        content:
            'The question of whether androids dream of electric sheep is the title and central theme of the\nscience fiction novel Do Androids Dream of Electric Sheep? by Philip K. Dick.\n\n' +
            '1. The book explores a world where androids are indistinguishable from humans except for a\n   lack of empathy. The story follows Rick Deckard, a bounty hunter who tracks down rogue\n   androids.\n\n' +
            '2. The title refers to the empathy test used to distinguish between humans and androids. The\n   test involves administering a fictional scenario and evaluating the subject\'s emotional\n   response. Electric sheep are rare, real animals that people own as status symbols. Owning\n   one is seen as a sign of empathy and a connection to the natural world.\n\n' +
            '3. The book never definitively answers the question of whether androids dream or not. It\n   explores the nature of reality, consciousness, and what it means to be human.\n\n' +
            '4. The book inspired the movie Blade Runner, though there are some key differences in plot.',
        role: 'ai',
        name: 'AI Chatbot',
        timestamp: '02:22 AM',
    },
    {
        id: 'user-2',
        content: "let's say it does - what happens then?",
        role: 'user',
        name: 'Farras',
        timestamp: '02:22 AM',
    },
    {
        id: 'ai-img',
        content: '',
        role: 'ai',
        name: 'AI Chatbot',
        timestamp: '02:22 AM',
        messageType: 'image',
        imageUrl: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1600',
    },
];

const AIChatbotPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
    });
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('userAvatarUrl') : null;
    });

    useEffect(() => {
        const syncAuthFromStorage = () => {
            const authed = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
            setIsAuthenticated(authed);
            const avatarUrl = typeof window !== 'undefined' ? localStorage.getItem('userAvatarUrl') : null;
            setUserAvatarUrl(avatarUrl);
        };

        syncAuthFromStorage();

        window.addEventListener('storage', syncAuthFromStorage);
        window.addEventListener('focus', syncAuthFromStorage);
        document.addEventListener('visibilitychange', syncAuthFromStorage);
        window.addEventListener('auth:changed', syncAuthFromStorage);

        return () => {
            window.removeEventListener('storage', syncAuthFromStorage);
            window.removeEventListener('focus', syncAuthFromStorage);
            document.removeEventListener('visibilitychange', syncAuthFromStorage);
            window.removeEventListener('auth:changed', syncAuthFromStorage);
        };
    }, []);

    // Force re-render when auth state changes
    useEffect(() => {
        const handleAuthChange = () => {
            const authed = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
            setIsAuthenticated(authed);
        };

        window.addEventListener('auth:changed', handleAuthChange);
        return () => window.removeEventListener('auth:changed', handleAuthChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userAvatarUrl');
        setIsAuthenticated(false);
        setUserAvatarUrl(null);
    };
    const [historyItems, setHistoryItems] = useState(() => sampleHistoryItems);
    const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(() => initialChatId);
    const [messagesByChatId, setMessagesByChatId] = useState<Record<string, Message[]>>(() => {
        if (!initialChatId) return {};
        return { [initialChatId]: initialChatMessages };
    });
    const [adminMessages, setAdminMessages] = useState<Message[] | null>(null);
    const [chatMode, setChatMode] = useState<'ai' | 'cs'>('ai');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
        return saved === 'dark' ? 'dark' : 'light';
    });
    const chatRef = useRef<ChatContainerHandle | null>(null);
    const messagesByChatIdRef = useRef(messagesByChatId);
    const adminMessagesRef = useRef(adminMessages);

    useEffect(() => {
        messagesByChatIdRef.current = messagesByChatId;
    }, [messagesByChatId]);

    useEffect(() => {
        adminMessagesRef.current = adminMessages;
    }, [adminMessages]);

    useEffect(() => {
        const prevThemeAttr = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        window.localStorage.setItem('theme', theme);

        return () => {
            if (prevThemeAttr === null) {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', prevThemeAttr);
            }
        };
    }, [theme]);

    const isDark = theme === 'dark';

    const pageClasses = useMemo(() => {
        return isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-gray-900';
    }, [isDark]);

    const makeChatTitle = (msgs: Message[]) => {
        const firstUser = msgs.find((m) => m.role === 'user' && m.content && m.content.trim().length > 0);
        const base = (firstUser?.content || '').trim();
        if (!base) return null;
        const normalized = base.replace(/\s+/g, ' ');
        const limit = 28;
        return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
    };

    const syncChatViewForMode = (nextMode: 'ai' | 'cs') => {
        if (nextMode === 'cs') {
            const msgs = adminMessagesRef.current;
            if (msgs && msgs.length > 0) {
                chatRef.current?.setMessages?.(msgs);
            } else {
                chatRef.current?.resetToGreeting?.();
            }
            return;
        }

        const currentId = activeHistoryId;
        if (currentId) {
            const msgs = messagesByChatIdRef.current[currentId];
            if (msgs && msgs.length > 0) {
                chatRef.current?.setMessages?.(msgs);
            } else {
                chatRef.current?.resetToGreeting?.();
            }
        }
    };

    

    const handleSelectHistory = (id: string) => {
        if (chatMode !== 'ai') return;
        const currentId = activeHistoryId;
        if (currentId) {
            const currentMessages = chatRef.current?.getMessages?.();
            if (currentMessages) {
                setMessagesByChatId((prev) => ({ ...prev, [currentId]: currentMessages }));
            }
        }

        setActiveHistoryId(id);
        const nextMessages = messagesByChatId[id];
        if (nextMessages && nextMessages.length > 0) {
            chatRef.current?.setMessages?.(nextMessages);
        } else {
            chatRef.current?.resetToGreeting?.();
        }
    };

    const handleNewChat = () => {
        if (chatMode !== 'ai') return;
        const currentId = activeHistoryId;
        if (currentId) {
            const currentMessages = chatRef.current?.getMessages?.();
            if (currentMessages) {
                setMessagesByChatId((prev) => ({ ...prev, [currentId]: currentMessages }));
            }
        }

        const id = `chat-${Date.now()}`;
        const nextItem = {
            id,
            title: 'New chat',
            timestamp: 'now',
        };
        setHistoryItems((prev) => [nextItem, ...prev]);
        setActiveHistoryId(id);
        chatRef.current?.resetToGreeting?.();
    };

    const handleDeleteHistory = (id: string) => {
        if (chatMode !== 'ai') return;
        setMessagesByChatId((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        setHistoryItems((prev) => {
            const next = prev.filter((x) => x.id !== id);
            const nextActive = (activeHistoryId === id) ? next[0]?.id : activeHistoryId;
            setActiveHistoryId(nextActive);
            if (next.length === 0) {
                setTimeout(() => handleNewChat(), 0);
            } else if (activeHistoryId === id && next[0]?.id) {
                const nextMessages = messagesByChatId[next[0].id];
                if (nextMessages && nextMessages.length > 0) {
                    chatRef.current?.setMessages?.(nextMessages);
                } else {
                    chatRef.current?.resetToGreeting?.();
                }
            }
            return next;
        });
    };

    const handleBack = () => {
        navigate('/', { replace: true });
    };

    const handleSwitchMode = (nextMode: 'ai' | 'cs') => {
        if (nextMode === chatMode) return;

        const currentMessages = chatRef.current?.getMessages?.();
        if (currentMessages) {
            if (chatMode === 'ai') {
                const currentId = activeHistoryId;
                if (currentId) {
                    setMessagesByChatId((prev) => ({ ...prev, [currentId]: currentMessages }));
                }
            } else {
                setAdminMessages(currentMessages);
            }
        }

        setChatMode(nextMode);
        setTimeout(() => {
            syncChatViewForMode(nextMode);
        }, 0);
    };

    useEffect(() => {
        syncChatViewForMode(chatMode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`fixed inset-0 overflow-hidden ${pageClasses}`}>
            <div
                className={
                    `h-full grid overflow-hidden ` +
                    (chatMode === 'ai' ? 'grid-cols-[72px_320px_1fr]' : 'grid-cols-[72px_1fr]') +
                    (!isAuthenticated ? ' pointer-events-none select-none blur-[1px]' : '')
                }
                aria-hidden={!isAuthenticated}
            >
                {/* Left icon sidebar */}
                <aside className={`h-full border-r flex flex-col items-center py-5 overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-gray-100 bg-white'}`}>
                    <button
                        type="button"
                        onClick={handleBack}
                        className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-gray-50'}`}
                        aria-label="Back"
                    >
                        <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                    </button>

                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
                        <button
                            type="button"
                            className={`w-11 h-11 p-0 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-900 hover:bg-slate-800/70' : 'bg-gray-50 hover:bg-gray-100'}`}
                            aria-label="Home"
                        >
                            <Home className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-700'}`} />
                        </button>

                        {chatMode === 'ai' && (
                            <button
                                type="button"
                                className="w-8 h-8 p-0 rounded-full bg-black text-white hover:bg-gray-900 flex items-center justify-center transition-colors"
                                aria-label="New chat"
                                onClick={handleNewChat}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="w-full flex flex-col items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-gray-50'}`}
                            aria-label="Settings"
                        >
                            <Settings className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-gray-50'}`}
                            aria-label="Log out"
                        >
                            <LogOut className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                        </button>

                        <div className={`w-10 h-10 rounded-full overflow-hidden border mb-1 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                            <img
                                src={userAvatarUrl || "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300"}
                                alt="User"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300";
                                }}
                            />
                        </div>
                    </div>
                </aside>

                {chatMode === 'ai' && (
                    <aside className={`h-full border-r overflow-hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-gray-100 bg-white'}`}>
                        <ChatHistory
                            historyItems={historyItems}
                            onSelectHistory={handleSelectHistory}
                            onDeleteHistory={handleDeleteHistory}
                            activeId={activeHistoryId}
                            theme={theme}
                        />
                    </aside>
                )}

                {/* Main chat area */}
                <section className={`h-full flex flex-col overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                    <header className={`h-16 border-b flex items-center justify-between px-6 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-sky-50'}`}>
                                <MessageSquareText className="w-5 h-5 text-sky-600" />
                            </div>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>AI Chatbot</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center rounded-full p-1 mr-2 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode('ai')}
                                    className={
                                        `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ` +
                                        (chatMode === 'ai'
                                            ? (isDark ? 'bg-slate-800 text-slate-100 shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                            : (isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-gray-900'))
                                    }
                                >
                                    Chat AI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode('cs')}
                                    className={
                                        `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ` +
                                        (chatMode === 'cs'
                                            ? (isDark ? 'bg-slate-800 text-slate-100 shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                                            : (isDark ? 'text-slate-300 hover:text-slate-100' : 'text-gray-600 hover:text-gray-900'))
                                    }
                                >
                                    Chat Admin
                                </button>
                            </div>
                            <button
                                type="button"
                                className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'bg-sky-50 hover:bg-sky-100'}`}
                                aria-label="Light"
                                onClick={() => setTheme('light')}
                            >
                                <Sun className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-sky-600'}`} />
                            </button>
                            <button
                                type="button"
                                className={`w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-900 hover:bg-slate-800/70' : 'hover:bg-gray-50'}`}
                                aria-label="Dark"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-gray-600'}`} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-hidden">
                        <div className="h-full">
                            <ChatContainer
                                ref={chatRef}
                                showActions={false}
                                showHeader={false}
                                senderRole="user"
                                theme={theme}
                                chatMode={chatMode}
                                onMessagesChange={(msgs) => {
                                    if (chatMode === 'cs') {
                                        setAdminMessages(msgs);
                                        return;
                                    }

                                    if (!activeHistoryId) return;
                                    setMessagesByChatId((prev) => ({ ...prev, [activeHistoryId]: msgs }));

                                    const title = makeChatTitle(msgs);
                                    if (!title) return;
                                    setHistoryItems((prev) => {
                                        const current = prev.find((x) => x.id === activeHistoryId);
                                        if (!current) return prev;
                                        if (current.title && current.title !== 'New chat') return prev;
                                        return prev.map((x) => (x.id === activeHistoryId ? { ...x, title } : x));
                                    });
                                }}
                                onChatModeChange={(m) => {
                                    if (m === 'ai' || m === 'cs') setChatMode(m);
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* User Profile - Bottom Left Corner */}
            {localStorage.getItem('isAuthenticated') === 'true' ? (
                <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-slate-700">
                    <UserAvatar size="sm" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                        {localStorage.getItem('userName')}
                    </span>
                </div>
            ) : (
                <div className="fixed bottom-6 left-6 z-50">
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg ${
                            isDark 
                                ? 'bg-sky-600 text-white hover:bg-sky-700' 
                                : 'bg-sky-500 text-white hover:bg-sky-600'
                        }`}
                    >
                        Login
                    </button>
                </div>
            )}

            {!isAuthenticated && (
                <>
                    {/* Back button on transparent overlay to return to landing page */}
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="fixed left-6 top-6 z-[110] inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-md hover:bg-white"
                        aria-label="Back to home"
                   >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <AuthModal
                        open
                        mode="signup"
                        closable={false}
                        onSuccess={() => setIsAuthenticated(true)}
                    />
                </>
            )}
        </div>
    );
};

export default AIChatbotPage;
