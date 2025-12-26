'use client';

import { useState, useEffect } from 'react';

interface ScoringRule {
  condition: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value?: string | number;
  min?: number;
  max?: number;
  values?: string[];
  score: number;
  weight?: number;
}

interface ScoringRuleEditorProps {
  fieldType: string;
  value: ScoringRule[];
  onChange: (rules: ScoringRule[]) => void;
  onRulesChange?: (count: number) => void;
}

export function ScoringRuleEditor({ fieldType, value, onChange, onRulesChange }: ScoringRuleEditorProps) {
  const [rules, setRules] = useState<ScoringRule[]>(value || []);

  // Synchroniser les règles avec la prop value lors du chargement initial uniquement
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!isInitialized && value) {
      setRules(value);
      if (onRulesChange) {
        onRulesChange(value.length);
      }
      setIsInitialized(true);
    }
  }, [value, onRulesChange, isInitialized]);

  // Notifier le parent du changement du nombre de règles
  useEffect(() => {
    if (onRulesChange) {
      onRulesChange(rules.length);
    }
  }, [rules, onRulesChange]);

  const updateRules = (newRules: ScoringRule[]) => {
    setRules(newRules);
  };

  const handleSave = () => {
    onChange(rules);
  };

  const addRule = () => {
    const newRule: ScoringRule = {
      condition: fieldType === 'NUMBER' ? 'greater_than' : 'equals',
      score: 10,
      weight: 1,
    };
    updateRules([...rules, newRule]);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    updateRules(updatedRules);
    // Sauvegarder automatiquement après suppression
    onChange(updatedRules);
  };

  const updateRule = (index: number, updates: Partial<ScoringRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    updateRules(newRules);
  };

  const getConditionOptions = () => {
    if (fieldType === 'NUMBER') {
      return [
        { value: 'equals', label: 'Égal à' },
        { value: 'greater_than', label: 'Supérieur à' },
        { value: 'less_than', label: 'Inférieur à' },
        { value: 'between', label: 'Entre' },
      ];
    }
    if (fieldType === 'SELECT') {
      return [
        { value: 'equals', label: 'Égal à' },
        { value: 'in', label: 'Dans la liste' },
      ];
    }
    return [
      { value: 'equals', label: 'Égal à' },
      { value: 'contains', label: 'Contient' },
    ];
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Règles de scoring</h4>

      {rules.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Aucune règle définie. Le champ donnera 10 points par défaut s'il est rempli.
          </p>
          <button
            type="button"
            onClick={addRule}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            + Ajouter une règle
          </button>
        </div>
      )}

      {rules.map((rule, index) => (
        <div key={index} className="p-3 bg-gray-100 border border-gray-300 rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <h5 className="text-sm font-medium text-gray-900">Règle {index + 1}</h5>
            <button
              type="button"
              onClick={() => removeRule(index)}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Supprimer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={rule.condition}
                onChange={(e) =>
                  updateRule(index, { condition: e.target.value as ScoringRule['condition'] })
                }
                className="w-full pl-2 pr-8 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.2em 1.2em',
                  paddingRight: '2rem'
                }}
              >
                {getConditionOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {rule.condition === 'between' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                  <input
                    type="number"
                    value={rule.min || ''}
                    onChange={(e) =>
                      updateRule(index, { min: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                  <input
                    type="number"
                    value={rule.max || ''}
                    onChange={(e) =>
                      updateRule(index, { max: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </>
            ) : rule.condition === 'in' ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Valeurs (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={rule.values?.join(', ') || ''}
                  onChange={(e) =>
                    updateRule(index, {
                      values: e.target.value.split(',').map((v) => v.trim()),
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Valeur</label>
                <input
                  type={fieldType === 'NUMBER' ? 'number' : 'text'}
                  value={rule.value || ''}
                  onChange={(e) =>
                    updateRule(
                      index,
                      fieldType === 'NUMBER'
                        ? { value: Number(e.target.value) }
                        : { value: e.target.value },
                    )
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                min="0"
                max="100"
                value={rule.score || 0}
                onChange={(e) => updateRule(index, { score: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pondération (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rule.weight || 1}
                onChange={(e) => updateRule(index, { weight: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
          </div>
        </div>
      ))}

      {rules.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addRule}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            + Ajouter une règle
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-gray-800"
          >
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
}

