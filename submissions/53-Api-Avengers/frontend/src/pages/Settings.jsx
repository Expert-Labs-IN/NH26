import React, { useState } from 'react';
import { User, Bell, Shield, Zap, Database, Globe, Lock, Mail, Calendar, Key, CheckCircle2 } from 'lucide-react';

const SettingsSection = ({ title, description, children }) => (
  <div className="mb-12">
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-white/40 text-sm">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon: Icon, title, description, action, isActive = false }) => (
  <div className="glass-card p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${isActive ? 'bg-secondary/10 text-secondary' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-white/40">{description}</p>
      </div>
    </div>
    <div>
      {action}
    </div>
  </div>
);

const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-secondary' : 'bg-white/10'}`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
  </button>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [toggles, setToggles] = useState({
    aiTriage: true,
    smartReplies: true,
    autoPrioritize: true,
    desktopNotifs: false,
    emailSummary: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'ai', label: 'AI Engine', icon: Zap },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Global Settings</h2>
        <p className="text-white/40">Manage your account preferences, AI configuration, and external integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-500">
              <SettingsSection title="Profile Information" description="Update your personal details and how you appear on the platform.">
                <div className="glass-card p-6 bg-white/[0.02]">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-white/5 p-1 relative group">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mohit" alt="Avatar" className="w-full h-full rounded-xl bg-black" />
                      <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Mohit (Executive)</h4>
                      <p className="text-sm text-white/40">mohit@nexcorp.com</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">First Name</label>
                      <input type="text" defaultValue="Mohit" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Role</label>
                      <input type="text" defaultValue="Executive" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary/50 transition-colors" />
                    </div>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Notifications" description="Choose what events you want to be notified about.">
                <SettingItem 
                  icon={Bell} 
                  title="Desktop Notifications" 
                  description="Receive push notifications for urgent emails and upcoming meetings."
                  action={<Toggle enabled={toggles.desktopNotifs} onChange={() => handleToggle('desktopNotifs')} />}
                />
                <SettingItem 
                  icon={Mail} 
                  title="Daily Executive Summary" 
                  description="Receive a morning brief of your inbox and schedule."
                  action={<Toggle enabled={toggles.emailSummary} onChange={() => handleToggle('emailSummary')} />}
                />
              </SettingsSection>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="animate-in fade-in duration-500">
              <SettingsSection title="AI Engine Preferences" description="Configure how the Agentic AI models process and handle your communications.">
                <div className="glass-card p-6 bg-white/[0.02] mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-bold mb-1">Active LLM Model</h4>
                      <p className="text-xs text-white/40">The primary model used for inbox triage.</p>
                    </div>
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-secondary/20">llama-3.1-8b</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-secondary/30 bg-secondary/5 cursor-pointer relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-secondary/10 to-transparent blur-xl rounded-full" />
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <p className="text-sm font-semibold">Groq (llama-3.1-8b-instant)</p>
                          <p className="text-xs text-white/40 mt-0.5">Ultra-fast inference. Used currently.</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] cursor-not-allowed opacity-50 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">OpenAI (GPT-4o)</p>
                        <p className="text-xs text-white/40 mt-0.5">Requires Pro tier.</p>
                      </div>
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>

                <SettingItem 
                  icon={Zap} 
                  isActive={true}
                  title="Autonomous Triage" 
                  description="Automatically analyze incoming emails and generate summaries."
                  action={<Toggle enabled={toggles.aiTriage} onChange={() => handleToggle('aiTriage')} />}
                />
                <SettingItem 
                  icon={Database} 
                  title="Smart Action Drafting" 
                  description="Pre-generate draft replies and calendar invites based on context."
                  action={<Toggle enabled={toggles.smartReplies} onChange={() => handleToggle('smartReplies')} />}
                />
              </SettingsSection>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-in fade-in duration-500">
              <SettingsSection title="Connected Accounts" description="Manage access to your external services.">
                <SettingItem 
                  icon={Mail} 
                  isActive={true}
                  title="Google Workspace (Gmail)" 
                  description="Connected as mohit@nexcorp.com. Syncs inbox securely."
                  action={
                    <button className="text-xs font-bold text-white/40 hover:text-red-400 uppercase tracking-widest transition-colors">
                      Disconnect
                    </button>
                  }
                />
                <SettingItem 
                  icon={Calendar} 
                  isActive={true}
                  title="Google Calendar" 
                  description="Connected. Used for smart scheduling and meeting extractions."
                  action={
                    <button className="text-xs font-bold text-white/40 hover:text-red-400 uppercase tracking-widest transition-colors">
                      Disconnect
                    </button>
                  }
                />
              </SettingsSection>
              
              <SettingsSection title="API Access" description="Developer capabilities.">
                <SettingItem 
                  icon={Key} 
                  title="Personal Access Tokens" 
                  description="Generate tokens to interact with the NexMail API programmatically."
                  action={
                    <button className="btn-primary py-1.5 px-3 text-xs">
                      Generate
                    </button>
                  }
                />
              </SettingsSection>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-500">
              <SettingsSection title="Account Security" description="Keep your executive account safe.">
                <SettingItem 
                  icon={Lock} 
                  title="Change Password" 
                  description="Update your credentials."
                  action={
                    <button className="bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Update
                    </button>
                  }
                />
                <SettingItem 
                  icon={Shield} 
                  title="Two-Factor Authentication" 
                  description="Add an extra layer of security to your account."
                  action={
                    <button className="btn-primary py-1.5 px-4 text-xs">
                      Enable 2FA
                    </button>
                  }
                />
              </SettingsSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
