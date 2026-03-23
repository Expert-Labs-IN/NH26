import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ChatBubbleProps {
  message: string;
  isBot?: boolean;
  timestamp: string;
  children?: React.ReactNode;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isBot = false, timestamp, children }) => {
  return (
    <div className={twMerge('flex w-full mb-6 relative group', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-xs mr-3 mt-auto mb-5 shadow-sm flex-shrink-0 ring-2 ring-white dark:ring-zinc-900 z-10">
          RX
        </div>
      )}
      <div className={twMerge('flex flex-col', isBot ? 'max-w-[75%] items-start' : 'max-w-[75%] items-end')}>
        <div
          className={twMerge(
            'px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed relative text-[14px]',
            isBot
              ? 'bg-white dark:bg-zinc-800 text-foreground rounded-bl-none border border-border'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-blue-500/20 shadow-md font-medium'
          )}
        >
          {message}
          {children}
        </div>
        <span className={twMerge(
          "text-[10px] font-semibold text-muted-foreground/70 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5",
          isBot ? "left-12" : "right-1"
        )}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
