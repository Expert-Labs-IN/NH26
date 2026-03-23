'use client';

import { useState, useEffect } from 'react';
import { Email, AIAnalysis } from '@/types';
import EmailList from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import AnalysisPanel from '@/components/AnalysisPanel';
import { Inbox, Sparkles, CheckCircle2, Menu, X } from 'lucide-react';

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load mock emails on mount
  useEffect(() => {
    fetch('/data/emails.json')
      .then((res) => res.json())
      .then((data) => {
        setEmails(data);
        if (data.length > 0) {
          setSelectedEmail(data[0]);
        }
      })
      .catch((error) => {
        console.error('Failed to load emails:', error);
        showNotification('error', 'Failed to load emails');
      });
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAnalyzeEmail = async () => {
    if (!selectedEmail) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: selectedEmail }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIAnalysis = await response.json();
      setAnalysis(result);
      showNotification('success', 'Email analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      showNotification('error', 'Failed to analyze email. Please check your API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveAction = (actionIndex: number) => {
    if (!analysis) return;

    const action = analysis.suggestedActions[actionIndex];
    const actionId = `${analysis.emailId}-${actionIndex}`;

    // Simulate action execution
    setExecutedActions([...executedActions, actionId]);

    let message = '';
    switch (action.type) {
      case 'reply':
        message = 'Reply drafted and ready to send!';
        break;
      case 'calendar':
        message = 'Calendar event created successfully!';
        break;
      case 'task':
        message = 'Tasks added to your task list!';
        break;
      default:
        message = 'Action executed successfully!';
    }

    showNotification('success', message);
  };

  const handleRejectAction = (actionIndex: number) => {
    showNotification('success', 'Action rejected');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Inbox className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agentic Email Assistant
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-Powered Email Triage & Automation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                AI-Powered
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-300">
                {executedActions.length} Actions Executed
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List Sidebar */}
        <div
          className={`${
            showSidebar ? 'w-full md:w-96' : 'w-0'
          } flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700`}
        >
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.id || null}
            onSelectEmail={(email) => {
              setSelectedEmail(email);
              setAnalysis(null);
            }}
          />
        </div>

        {/* Email Detail */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`${analysis ? 'w-1/2' : 'w-full'} flex-shrink-0 overflow-hidden`}>
            {selectedEmail ? (
              <EmailDetail
                email={selectedEmail}
                onAnalyze={handleAnalyzeEmail}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select an email to view</p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          {analysis && (
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 animate-slide-in">
              <AnalysisPanel
                analysis={analysis}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>
            © 2026 Agentic Email Assistant • Built with Next.js & Claude AI
          </p>
          <div className="flex items-center gap-4">
            <span>
              {emails.length} emails • {selectedEmail ? '1 selected' : 'None selected'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
