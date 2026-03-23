'use client';

import { AIAnalysis } from '@/types';
import { Lightbulb, TrendingUp, MessageSquare, AlertTriangle } from 'lucide-react';
import ActionCard from './ActionCard';

interface AnalysisPanelProps {
  analysis: AIAnalysis;
  onApproveAction: (actionIndex: number) => void;
  onRejectAction: (actionIndex: number) => void;
}

export default function AnalysisPanel({
  analysis,
  onApproveAction,
  onRejectAction,
}: AnalysisPanelProps) {
  const getSentimentIcon = () => {
    switch (analysis.sentiment) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = () => {
    switch (analysis.sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">AI Analysis</h2>
        </div>
        <p className="text-white/90">
          AI assistant has analyzed this email and prepared {analysis.suggestedActions.length} automated{' '}
          {analysis.suggestedActions.length === 1 ? 'action' : 'actions'} for your review.
        </p>
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Thread Summary
        </h3>
        <ul className="space-y-2">
          {analysis.summary.points.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-semibold mt-0.5">
                {idx + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{point}</span>
            </li>
          ))}
        </ul>

        {analysis.summary.keyTopics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Key Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.summary.keyTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            {getSentimentIcon()}
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sentiment
            </h4>
          </div>
          <p className={`text-lg font-semibold capitalize ${getSentimentColor()} inline-block px-3 py-1 rounded-lg`}>
            {analysis.sentiment}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Action Required
            </h4>
          </div>
          <p className={`text-lg font-semibold ${
            analysis.requiresAction
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {analysis.requiresAction ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Suggested Actions
        </h3>

        {analysis.suggestedActions.map((action, idx) => (
          <ActionCard
            key={idx}
            type={action.type}
            data={action.data}
            confidence={action.confidence}
            reasoning={action.reasoning}
            onApprove={() => onApproveAction(idx)}
            onReject={() => onRejectAction(idx)}
            onEdit={(editedData) => {
              // Handle edit if needed
              console.log('Edited data:', editedData);
            }}
          />
        ))}
      </div>
    </div>
  );
}
