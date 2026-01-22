'use client';

import { useState } from 'react';
import { Target, MousePointer, FileText, Clock } from 'lucide-react';

interface GoalSelectorProps {
  selectedGoal: string;
  selectedEvent: string;
  onGoalChange: (goal: string) => void;
  onEventChange: (event: string) => void;
}

const goalTypes = [
  {
    id: 'conversion',
    name: 'Conversion',
    description: 'Track specific conversion actions',
    icon: Target,
  },
  {
    id: 'engagement',
    name: 'Engagement',
    description: 'Measure user engagement',
    icon: MousePointer,
  },
  {
    id: 'clicks',
    name: 'Clicks',
    description: 'Track button and link clicks',
    icon: MousePointer,
  },
  {
    id: 'time_on_page',
    name: 'Time on Page',
    description: 'Measure session duration',
    icon: Clock,
  },
];

const conversionEvents = [
  { id: 'button_click', name: 'Button Click', description: 'CTA button clicked' },
  { id: 'form_submit', name: 'Form Submission', description: 'Form successfully submitted' },
  { id: 'link_click', name: 'Link Click', description: 'Any link clicked' },
  { id: 'page_view', name: 'Page View', description: 'Specific page viewed' },
  { id: 'custom', name: 'Custom Event', description: 'Custom tracking event' },
];

export default function GoalSelector({
  selectedGoal,
  selectedEvent,
  onGoalChange,
  onEventChange,
}: GoalSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Goal Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Goal
        </label>
        <div className="grid grid-cols-2 gap-3">
          {goalTypes.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onGoalChange(goal.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedGoal === goal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded ${
                      selectedGoal === goal.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        selectedGoal === goal.id ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{goal.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {goal.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversion Event Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Conversion Event
        </label>
        <div className="space-y-2">
          {conversionEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventChange(event.id)}
              className={`w-full p-3 border rounded-lg text-left transition-all ${
                selectedEvent === event.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{event.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{event.description}</div>
                </div>
                {selectedEvent === event.id && (
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-sm text-gray-900 mb-2">How it works</h4>
        <p className="text-xs text-gray-600">
          The primary goal defines what success looks like for this test. The conversion
          event specifies the exact user action we&apos;re tracking. Choose the combination that
          best aligns with your business objectives.
        </p>
      </div>
    </div>
  );
}
