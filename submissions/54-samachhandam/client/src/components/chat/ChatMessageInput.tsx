import React from 'react';
import { Send } from 'lucide-react';

interface ChatMessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-background/80 backdrop-blur-md border-t border-border flex items-center space-x-3 rounded-b-3xl z-10"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message to ResolveX..."
        disabled={disabled}
        className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 border border-transparent rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-foreground placeholder:text-muted-foreground/70"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all active:scale-95 flex items-center justify-center group"
      >
        <Send size={18} className="ml-0.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </form>
  );
};

export default ChatMessageInput;
