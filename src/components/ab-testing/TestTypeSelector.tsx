'use client';

import { Zap, MousePointer } from 'lucide-react';

export type TestType = 'PAGE_REDIRECT' | 'ELEMENT_TEST';

interface TestTypeSelectorProps {
  selectedType: TestType;
  onChange: (type: TestType) => void;
}

const testTypes = [
  {
    id: 'PAGE_REDIRECT' as TestType,
    name: 'Page Redirect',
    description: 'Compare two different pages against each other',
    icon: Zap,
    features: [
      'Test completely different page designs',
      'Compare existing pages',
      'Quick setup - just select 2 pages',
    ],
  },
  {
    id: 'ELEMENT_TEST' as TestType,
    name: 'Element Test',
    description: 'Use visual editor to create variants with element changes',
    icon: MousePointer,
    features: [
      'Change copy, colors, and styles',
      'Add or remove elements',
      'Visual editor for precise control',
    ],
  },
];

export default function TestTypeSelector({ selectedType, onChange }: TestTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Test Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`
                relative p-5 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                </div>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`
                    font-semibold text-base mb-1
                    ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                  `}
                  >
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <ul className="space-y-1.5">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-600">
                        <svg
                          className={`w-4 h-4 mr-1.5 flex-shrink-0 ${
                            isSelected ? 'text-blue-500' : 'text-gray-400'
                          }`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
