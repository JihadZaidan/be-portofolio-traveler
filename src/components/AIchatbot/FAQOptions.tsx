import React from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';

interface FAQOption {
    id: string;
    question: string;
}

interface FAQOptionsProps {
    options: FAQOption[];
    onSelectFAQ: (question: string) => void;
    onSelectCS: () => void;
    timestamp?: string;
}

const FAQOptions: React.FC<FAQOptionsProps> = ({ options, onSelectFAQ, onSelectCS, timestamp }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 w-full max-w-full sm:max-w-md">
            {/* Greeting Message */}
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
                Hi! Thanks for your interest! Want to learn more about our services? I have all the information you need — just ask!
            </p>

            {/* FAQ Options as Interactive Buttons */}
            <div className="space-y-3 mb-6">
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelectFAQ(option.question)}
                        className="group flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-sky-50/50 hover:bg-sky-100 border border-transparent hover:border-sky-200 transition-all duration-200"
                    >
                        <div className="w-8 h-8 rounded-full bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center flex-shrink-0 transition-colors">
                            <MessageCircle className="w-4 h-4 text-sky-500" />
                        </div>
                        <span className="text-sky-600 group-hover:text-sky-700 text-sm font-medium transition-colors break-words">
                            {option.question}
                        </span>
                    </button>
                ))}
            </div>

            {/* Footer with timestamp */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4 px-1">
                <span>Sent by AI Assistant</span>
                <span>{timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Chat with CS Button */}
            <button
                onClick={onSelectCS}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full hover:from-rose-600 hover:to-rose-700 transition-all duration-200 text-xs shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
                <MessageSquare className="w-5 h-5" />
                <span>Chat with Seller</span>
            </button>
        </div>
    );
};

export default FAQOptions;
