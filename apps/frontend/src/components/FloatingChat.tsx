import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cx(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const FloatingChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ id: number; text: string; sender: 'admin' | 'user' }[]>([
        { id: 1, text: 'Xin chào! Chúng tôi có thể giúp gì cho bạn hôm nay?', sender: 'admin' },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message
        setMessages((prev) => [...prev, { id: Date.now(), text: message, sender: 'user' }]);
        setMessage('');

        // Mock admin response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong giây lát.', sender: 'admin' },
            ]);
        }, 1000);
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div
                className={cx(
                    'mb-4 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800 border border-gray-100',
                    isOpen
                        ? 'h-[450px] w-[350px] scale-100 opacity-100'
                        : 'h-0 w-0 scale-95 opacity-0 pointer-events-none'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-primary p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-green-400"></span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
                            <p className="text-xs text-white/80">Trực tuyến</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cx(
                                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                                msg.sender === 'user'
                                    ? 'self-end bg-primary text-white rounded-br-sm'
                                    : 'self-start bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'
                            )}
                        >
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping group-hover:animate-none"></span>
                )}
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 transition-transform duration-300 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default FloatingChat;
