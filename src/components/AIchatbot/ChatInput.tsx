import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
    theme?: 'light' | 'dark';
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    placeholder = "What would you like to know?",
    disabled = false,
    theme = 'light'
}) => {
    const isDark = theme === 'dark';
    const [inputValue, setInputValue] = useState('');
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleAttachmentClick = () => {
        attachmentInputRef.current?.click();
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSendMessage(`[File: ${file.name}]`);
        }
        e.target.value = '';
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 pb-5">
            <div className={`flex items-center gap-3 rounded-full border shadow-sm px-3 py-2 ${isDark ? 'bg-slate-900/60 border-slate-800 shadow-black/20' : 'bg-white border-gray-200'}`}>
                <input
                    ref={attachmentInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                    onChange={handleAttachmentChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className={`w-10 h-10 p-0 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-gray-50'}`}
                    aria-label="Attach"
                >
                    <Paperclip className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-gray-500'}`} />
                </button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-100 placeholder-slate-500' : 'text-gray-700 placeholder-gray-400'}`}
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || disabled}
                    className={`w-11 h-11 p-0 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-sky-500 hover:bg-sky-400 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
