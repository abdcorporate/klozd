'use client';

import { useState } from 'react';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

interface ConditionalRule {
  id: string;
  fieldId: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'notEquals';
  value: string;
  thenAction: 'qualify' | 'disqualify' | 'redirect' | 'showField' | 'hideField';
  thenValue?: string;
  elseAction?: 'qualify' | 'disqualify' | 'redirect' | 'showField' | 'hideField';
  elseValue?: string;
}

interface ConditionalLogicEditorProps {
  fieldIndex: number;
  fieldId: string;
}

export function ConditionalLogicEditor({ fieldIndex, fieldId }: ConditionalLogicEditorProps) {
  const { watch, setValue, getValues } = useFormContext();
  const [showEditor, setShowEditor] = useState(false);
  
  // Charger les règles sauvegardées depuis le formulaire
  const savedRulesJson = watch(`formFields.${fieldIndex}.conditionalRulesJson`);
  const [rules, setRules] = useState<ConditionalRule[]>(() => {
    if (savedRulesJson) {
      try {
        return JSON.parse(savedRulesJson);
      } catch {
        return [];
      }
    }
    return [];
  });

  const formFields = watch('formFields') || [];

  const handleAddRule = () => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      fieldId: '',
      operator: 'equals',
      value: '',
      thenAction: 'qualify',
    };
    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = rules.filter(r => r.id !== ruleId);
    setRules(updatedRules);
    // Sauvegarder automatiquement après suppression
    const conditionalRulesJson = updatedRules.length > 0 ? JSON.stringify(updatedRules) : '';
    setValue(`formFields.${fieldIndex}.conditionalRulesJson`, conditionalRulesJson || undefined);
  };

  const handleSaveRules = () => {
    // Sauvegarder les règles dans le champ
    const conditionalRulesJson = rules.length > 0 ? JSON.stringify(rules) : '';
    setValue(`formFields.${fieldIndex}.conditionalRulesJson`, conditionalRulesJson || undefined);
    setShowEditor(false);
  };

  // Synchroniser avec les règles sauvegardées au chargement initial uniquement
  const [isInitialized, setIsInitialized] = React.useState(false);
  React.useEffect(() => {
    if (!isInitialized) {
      if (savedRulesJson) {
        try {
          const parsed = JSON.parse(savedRulesJson);
          setRules(parsed);
        } catch {
          setRules([]);
        }
      } else {
        setRules([]);
      }
      setIsInitialized(true);
    }
  }, [savedRulesJson, isInitialized]);

  // Déterminer le nombre de règles à afficher (sauvegardées ou en cours d'édition)
  const displayRules = showEditor ? rules : (savedRulesJson ? (() => {
    try {
      return JSON.parse(savedRulesJson);
    } catch {
      return [];
    }
  })() : []);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEditor(!showEditor)}
          className="text-sm transition-colors font-medium px-3 py-1.5 rounded-md"
          style={{ 
            backgroundColor: '#fff4e6',
            color: '#dd7200',
            border: '1px solid #ffd89b'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffe8cc';
            e.currentTarget.style.color = '#b85f00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff4e6';
            e.currentTarget.style.color = '#dd7200';
          }}
        >
          {showEditor ? 'Masquer' : 'Configurer'} logiques conditionnelles
        </button>
        {displayRules.length > 0 && (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {displayRules.length} règle{displayRules.length > 1 ? 's' : ''} configurée{displayRules.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {showEditor && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Logiques conditionnelles
          </div>

          {rules.length === 0 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Aucune logique définie. Cliquez sur "Ajouter une logique" pour commencer.
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                + Ajouter une logique
              </button>
            </div>
          )}

          {rules.map((rule, index) => (
            <div key={rule.id} className="p-3 bg-white rounded border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-medium text-gray-700">Règle {index + 1}</div>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SI</label>
                    <select
                      value={rule.fieldId}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].fieldId = e.target.value;
                        setRules(updated);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Sélectionner un champ</option>
                      {formFields.map((field: any, idx: number) => (
                        <option key={idx} value={field.id || idx}>
                          {field.label || `Champ ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opérateur</label>
                    <select
                      value={rule.operator}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].operator = e.target.value as any;
                        setRules(updated);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="equals">=</option>
                      <option value="notEquals">≠</option>
                      <option value="greaterThan">&gt;</option>
                      <option value="lessThan">&lt;</option>
                      <option value="contains">Contient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Valeur</label>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].value = e.target.value;
                        setRules(updated);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">ALORS</label>
                    <select
                      value={rule.thenAction}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].thenAction = e.target.value as any;
                        setRules(updated);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="qualify">Qualifier</option>
                      <option value="disqualify">Disqualifier</option>
                      <option value="redirect">Rediriger vers URL</option>
                      <option value="showField">Afficher champ</option>
                      <option value="hideField">Masquer champ</option>
                    </select>
                    {rule.thenAction === 'redirect' && (
                      <input
                        type="url"
                        value={rule.thenValue || ''}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[index].thenValue = e.target.value;
                          setRules(updated);
                        }}
                        placeholder="https://..."
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SINON</label>
                    <select
                      value={rule.elseAction || ''}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[index].elseAction = e.target.value as any || undefined;
                        setRules(updated);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Aucune action</option>
                      <option value="qualify">Qualifier</option>
                      <option value="disqualify">Disqualifier</option>
                      <option value="redirect">Rediriger vers URL</option>
                      <option value="showField">Afficher champ</option>
                      <option value="hideField">Masquer champ</option>
                    </select>
                    {rule.elseAction === 'redirect' && (
                      <input
                        type="url"
                        value={rule.elseValue || ''}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[index].elseValue = e.target.value;
                          setRules(updated);
                        }}
                        placeholder="https://..."
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {rules.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mr-2"
              >
                + Ajouter une logique
              </button>
              <button
                type="button"
                onClick={handleSaveRules}
                className="px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

