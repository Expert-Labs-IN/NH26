import React from 'react';
import { MessageSquare, Ticket, User, Bell, ChevronRight } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  description?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, description }) => (
  <button
    onClick={onClick}
    className="flex items-center p-4 bg-card hover:bg-accent/50 rounded-2xl border border-border soft-shadow transition-all group w-full text-left"
  >
    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <h3 className="font-semibold text-sm">{label}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
  </button>
);

interface QuickActionsProps {
  onAction: (action: string) => void;
  layout?: 'grid' | 'list';
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, layout = 'grid' }) => {
  const actions = [
    { id: 'billing', label: 'Billing Issue', icon: <Ticket size={20} />, description: 'Issues with payments or plans' },
    { id: 'technical', label: 'Technical Support', icon: <MessageSquare size={20} />, description: 'App crashes or bug reports' },
    { id: 'track', label: 'Track Ticket', icon: <Bell size={20} />, description: 'Check status of your report' },
    { id: 'agent', label: 'Talk to Agent', icon: <User size={20} />, description: 'Connect with a human' },
  ];

  return (
    <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
      {actions.map((action) => (
        <QuickAction
          key={action.id}
          icon={action.icon}
          label={action.label}
          description={action.description}
          onClick={() => onAction(action.id)}
        />
      ))}
    </div>
  );
};

export default QuickActions;
