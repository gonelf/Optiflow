'use client';

import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2, Type, Palette, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ElementChange {
  id: string;
  elementId: string;
  elementSelector: string; // CSS selector
  changeType: 'text' | 'style' | 'hide' | 'show' | 'remove' | 'add';
  oldValue?: any;
  newValue?: any;
  description?: string;
}

export interface ElementVariantConfig {
  name: string;
  description?: string;
  isControl: boolean;
  changes: ElementChange[];
}

interface ElementTestEditorProps {
  variants: ElementVariantConfig[];
  onChange: (variants: ElementVariantConfig[]) => void;
}

const changeTypes = [
  { value: 'text', label: 'Change Text', icon: Type, color: 'blue' },
  { value: 'style', label: 'Change Style', icon: Palette, color: 'purple' },
  { value: 'hide', label: 'Hide Element', icon: EyeOff, color: 'orange' },
  { value: 'show', label: 'Show Element', icon: Eye, color: 'green' },
  { value: 'remove', label: 'Remove Element', icon: Trash2, color: 'red' },
  { value: 'add', label: 'Add Element', icon: Plus, color: 'emerald' },
];

export default function ElementTestEditor({ variants, onChange }: ElementTestEditorProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(1); // Start with first non-control variant

  const addVariant = () => {
    const newVariant: ElementVariantConfig = {
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      description: '',
      isControl: false,
      changes: [],
    };
    onChange([...variants, newVariant]);
    setSelectedVariantIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      alert('You must have at least 2 variants (control and one test variant)');
      return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
    if (selectedVariantIndex >= newVariants.length) {
      setSelectedVariantIndex(newVariants.length - 1);
    }
  };

  const updateVariantName = (index: number, name: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], name };
    onChange(newVariants);
  };

  const updateVariantDescription = (index: number, description: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], description };
    onChange(newVariants);
  };

  const addChange = (variantIndex: number) => {
    const newChange: ElementChange = {
      id: `change-${Date.now()}`,
      elementId: '',
      elementSelector: '',
      changeType: 'text',
      oldValue: '',
      newValue: '',
      description: '',
    };

    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      changes: [...newVariants[variantIndex].changes, newChange],
    };
    onChange(newVariants);
  };

  const removeChange = (variantIndex: number, changeId: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      changes: newVariants[variantIndex].changes.filter((c) => c.id !== changeId),
    };
    onChange(newVariants);
  };

  const updateChange = (
    variantIndex: number,
    changeId: string,
    field: keyof ElementChange,
    value: any
  ) => {
    const newVariants = [...variants];
    const changeIndex = newVariants[variantIndex].changes.findIndex((c) => c.id === changeId);
    if (changeIndex !== -1) {
      newVariants[variantIndex].changes[changeIndex] = {
        ...newVariants[variantIndex].changes[changeIndex],
        [field]: value,
      };
      onChange(newVariants);
    }
  };

  // Ensure at least control and one variant
  if (variants.length < 2) {
    const initialVariants: ElementVariantConfig[] = [
      { name: 'Control', description: 'Original version', isControl: true, changes: [] },
      { name: 'Variant A', description: '', isControl: false, changes: [] },
    ];
    onChange(initialVariants);
    return null;
  }

  const selectedVariant = variants[selectedVariantIndex];

  return (
    <div className="space-y-4">
      {/* Variant Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Variants <span className="text-red-500">*</span>
          </label>
          <Button type="button" onClick={addVariant} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {variants.map((variant, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedVariantIndex(index)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  selectedVariantIndex === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {variant.name}
              {variant.isControl && (
                <span className="ml-2 text-xs opacity-75">(Control)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Variant Editor */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={selectedVariant.name}
              onChange={(e) => updateVariantName(selectedVariantIndex, e.target.value)}
              className="text-lg font-semibold border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-0 py-1 mb-2"
              placeholder="Variant name"
              disabled={selectedVariant.isControl}
            />
            <textarea
              value={selectedVariant.description || ''}
              onChange={(e) => updateVariantDescription(selectedVariantIndex, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Describe the changes in this variant..."
              disabled={selectedVariant.isControl}
            />
          </div>
          {!selectedVariant.isControl && selectedVariantIndex > 0 && (
            <Button
              type="button"
              onClick={() => removeVariant(selectedVariantIndex)}
              size="sm"
              variant="ghost"
              className="text-red-600 ml-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {selectedVariant.isControl ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              This is the control variant (original version). No changes can be made here.
            </p>
          </div>
        ) : (
          <>
            {/* Element Changes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Element Changes</h4>
                <Button
                  type="button"
                  onClick={() => addChange(selectedVariantIndex)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Change
                </Button>
              </div>

              {selectedVariant.changes.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Move className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">No changes yet</p>
                  <p className="text-xs text-gray-500">
                    Add element changes to create this variant
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedVariant.changes.map((change) => {
                    const changeTypeInfo = changeTypes.find((t) => t.value === change.changeType);
                    const Icon = changeTypeInfo?.icon || Type;

                    return (
                      <div
                        key={change.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg bg-${changeTypeInfo?.color}-100 text-${changeTypeInfo?.color}-600`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Change Type */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Change Type
                                </label>
                                <select
                                  value={change.changeType}
                                  onChange={(e) =>
                                    updateChange(
                                      selectedVariantIndex,
                                      change.id,
                                      'changeType',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {changeTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Element Selector */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Element Selector
                                </label>
                                <input
                                  type="text"
                                  value={change.elementSelector}
                                  onChange={(e) =>
                                    updateChange(
                                      selectedVariantIndex,
                                      change.id,
                                      'elementSelector',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder=".button, #hero-title"
                                />
                              </div>
                            </div>

                            {/* Old/New Value (conditional based on change type) */}
                            {['text', 'style'].includes(change.changeType) && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {change.changeType === 'text' ? 'Original Text' : 'Original Style'}
                                  </label>
                                  <input
                                    type="text"
                                    value={change.oldValue || ''}
                                    onChange={(e) =>
                                      updateChange(
                                        selectedVariantIndex,
                                        change.id,
                                        'oldValue',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={
                                      change.changeType === 'text' ? 'Original text' : 'color: blue'
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {change.changeType === 'text' ? 'New Text' : 'New Style'}
                                  </label>
                                  <input
                                    type="text"
                                    value={change.newValue || ''}
                                    onChange={(e) =>
                                      updateChange(
                                        selectedVariantIndex,
                                        change.id,
                                        'newValue',
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={
                                      change.changeType === 'text' ? 'New text' : 'color: red'
                                    }
                                  />
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Description (optional)
                              </label>
                              <input
                                type="text"
                                value={change.description || ''}
                                onChange={(e) =>
                                  updateChange(
                                    selectedVariantIndex,
                                    change.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe this change..."
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={() => removeChange(selectedVariantIndex, change.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg
            className="h-5 w-5 text-blue-500 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Element Tests Work</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Define element changes using CSS selectors (e.g., .button, #title)</li>
              <li>• Changes are applied dynamically when the variant is shown</li>
              <li>• The control variant shows the original page without changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
