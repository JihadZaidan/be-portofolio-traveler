import React from 'react';
import { MessageSquare, Trash2, MoreHorizontal, ChevronDown, LayoutGrid, ShoppingCart } from 'lucide-react';

interface ChatHistoryItem {
    id: string;
    title: string;
    preview?: string;
    timestamp: string;
}

interface ChatHistoryProps {
    historyItems: ChatHistoryItem[];
    onSelectHistory: (id: string) => void;
    onDeleteHistory?: (id: string) => void;
    activeId?: string;
    theme?: 'light' | 'dark';
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ historyItems, onSelectHistory, onDeleteHistory, activeId, theme = 'light' }) => {
    const isDark = theme === 'dark';
    return (
        <div className={`h-full flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-gray-900'}`}>
            <div className={`px-5 pt-5 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                <button
                    type="button"
                    className={`w-full flex items-center gap-3 py-2 text-left text-sm font-semibold rounded-lg px-2 -mx-2 transition-colors ${isDark ? 'text-slate-100 hover:bg-slate-900' : 'text-gray-800 hover:bg-gray-50'}`}
                >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                        <LayoutGrid className={`w-4 h-4 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                    </span>
                    <span>Explore Blog</span>
                </button>
                <button
                    type="button"
                    className={`w-full flex items-center gap-3 py-2 text-left text-sm font-semibold rounded-lg px-2 -mx-2 transition-colors ${isDark ? 'text-slate-100 hover:bg-slate-900' : 'text-gray-800 hover:bg-gray-50'}`}
                >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                        <ShoppingCart className={`w-4 h-4 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                    </span>
                    <span>Store</span>
                </button>
            </div>

            <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                        <span>Recent Chats</span>
                    </div>
                    <button type="button" className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-900' : 'hover:bg-gray-50'}`} aria-label="Toggle">
                        <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-gray-500'}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {historyItems.length === 0 ? (
                    <div className="text-center py-10 px-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
                            <MessageSquare className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Belum ada riwayat chat</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {historyItems.map((item) => {
                            const isActive = activeId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={
                                        `group relative flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ` +
                                        (isDark
                                            ? (isActive ? 'bg-sky-500/10' : 'hover:bg-slate-900/60')
                                            : (isActive ? 'bg-sky-50/70' : 'hover:bg-gray-50'))
                                    }
                                    onClick={() => onSelectHistory(item.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') onSelectHistory(item.id);
                                    }}
                                >
                                    <div className={
                                        `absolute left-0 top-0 h-full w-1 ` +
                                        (isActive ? 'bg-sky-500' : 'bg-transparent')
                                    } />

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{item.title}</p>
                                    </div>

                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <span className={`text-xs group-hover:opacity-0 transition-opacity ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{item.timestamp}</span>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                className={`rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-white/70'}`}
                                                aria-label="Delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteHistory?.(item.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                            </button>
                                            <button
                                                type="button"
                                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-white/70'}`}
                                                aria-label="More"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <MoreHorizontal className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-gray-500'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHistory;
