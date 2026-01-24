'use client';

/**
 * Funnel Builder Component
 * Allows users to create and configure conversion funnels
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FunnelStep } from '@/services/analytics/funnel.service';
// import { EventType } from '@prisma/client';
type EventType = 'PAGE_VIEW' | 'CLICK' | 'FORM_SUBMIT' | 'SCROLL' | 'TIME_ON_PAGE' | 'CONVERSION';

interface FunnelBuilderProps {
  onAnalyze: (steps: FunnelStep[]) => void;
}

export function FunnelBuilder({ onAnalyze }: FunnelBuilderProps) {
  const [steps, setSteps] = useState<FunnelStep[]>([
    {
      id: 'step-1',
      name: 'Page View',
      eventType: 'PAGE_VIEW' as EventType,
      order: 1,
    },
  ]);

  const addStep = () => {
    const newStep: FunnelStep = {
      id: `step-${steps.length + 1}`,
      name: `Step ${steps.length + 1}`,
      eventType: 'CLICK' as EventType,
      order: steps.length + 1,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof FunnelStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleAnalyze = () => {
    onAnalyze(steps);
  };

  const loadTemplate = (template: { name: string; steps: FunnelStep[] }) => {
    setSteps(template.steps);
  };

  const templates = [
    {
      name: 'Basic Conversion',
      steps: [
        { id: 'step-1', name: 'Page View', eventType: 'PAGE_VIEW' as EventType, order: 1 },
        { id: 'step-2', name: 'Click CTA', eventType: 'CLICK' as EventType, order: 2 },
        { id: 'step-3', name: 'Form Submit', eventType: 'FORM_SUBMIT' as EventType, order: 3 },
        { id: 'step-4', name: 'Conversion', eventType: 'CONVERSION' as EventType, order: 4 },
      ],
    },
    {
      name: 'Lead Generation',
      steps: [
        { id: 'step-1', name: 'Landing Page', eventType: 'PAGE_VIEW' as EventType, order: 1 },
        { id: 'step-2', name: 'Scroll to Form', eventType: 'SCROLL' as EventType, order: 2 },
        { id: 'step-3', name: 'Submit Form', eventType: 'FORM_SUBMIT' as EventType, order: 3 },
      ],
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Build Your Funnel</h3>

      {/* Template selection */}
      <div className="mb-6">
        <Label className="text-sm text-gray-600 mb-2 block">
          Or start with a template
        </Label>
        <div className="flex gap-2">
          {templates.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => loadTemplate(template)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Funnel steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-3 p-4 border rounded-lg relative"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
              {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">
                  Step Name
                </Label>
                <Input
                  value={step.name}
                  onChange={(e) => updateStep(index, 'name', e.target.value)}
                  placeholder="e.g., Page View"
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">
                  Event Type
                </Label>
                <select
                  value={step.eventType}
                  onChange={(e) => updateStep(index, 'eventType', e.target.value as EventType)}
                  className="w-full h-9 px-3 border rounded-md text-sm bg-white"
                >
                  <option value="PAGE_VIEW">Page View</option>
                  <option value="CLICK">Click</option>
                  <option value="FORM_SUBMIT">Form Submit</option>
                  <option value="SCROLL">Scroll</option>
                  <option value="CONVERSION">Conversion</option>
                  <option value="TIME_ON_PAGE">Time on Page</option>
                </select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">
                  Element ID (optional)
                </Label>
                <Input
                  value={step.elementId || ''}
                  onChange={(e) => updateStep(index, 'elementId', e.target.value || undefined)}
                  placeholder="e.g., cta-button"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {steps.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStep(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                ✕
              </Button>
            )}

            {/* Arrow indicator */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 -bottom-4 text-gray-400 text-xl">
                ↓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={addStep} className="flex-1">
          + Add Step
        </Button>
        <Button
          onClick={handleAnalyze}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={steps.length === 0}
        >
          Analyze Funnel
        </Button>
      </div>
    </Card>
  );
}
