'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScoringRuleEditor } from './scoring-rule-editor';
import { ConditionalLogicEditor } from './conditional-logic-editor';

interface FormFieldEditorProps {
  index: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FormFieldEditor({
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: FormFieldEditorProps) {
  const { register, watch, setValue } = useFormContext();
  const [showScoringRules, setShowScoringRules] = useState(false);
  const [currentScoringRulesCount, setCurrentScoringRulesCount] = useState(0);

  const fieldType = watch(`formFields.${index}.type`);
  const scoringRulesJson = watch(`formFields.${index}.scoringRulesJson`);
  const fieldId = watch(`formFields.${index}.id`) || `field-${index}`;

  // Calculer le nombre de règles sauvegardées
  const savedRulesCount = scoringRulesJson ? (() => {
    try {
      const rules = JSON.parse(scoringRulesJson);
      return rules && Array.isArray(rules) ? rules.length : 0;
    } catch {
      return 0;
    }
  })() : 0;

  // Utiliser le nombre de règles en cours d'édition si l'éditeur est ouvert, sinon les règles sauvegardées
  const displayRulesCount = showScoringRules ? currentScoringRulesCount : savedRulesCount;

  const fieldTypes = [
    { value: 'TEXT', label: 'Texte' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Téléphone' },
    { value: 'NUMBER', label: 'Nombre' },
    { value: 'SELECT', label: 'Liste déroulante' },
    { value: 'RADIO', label: 'Boutons radio' },
    { value: 'CHECKBOX', label: 'Cases à cocher' },
    { value: 'TEXTAREA', label: 'Zone de texte' },
    { value: 'DATE', label: 'Date' },
    { value: 'BUDGET', label: 'Budget (€)' },
    { value: 'RATING', label: 'Note (étoiles)' },
  ];

  const handleScoringRulesChange = (rules: any[]) => {
    setCurrentScoringRulesCount(rules.length);
    if (rules.length > 0) {
      setValue(`formFields.${index}.scoringRulesJson`, JSON.stringify(rules));
    } else {
      setValue(`formFields.${index}.scoringRulesJson`, undefined);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {index + 1}
          </div>
          <h3 className="font-medium text-gray-900">Champ {index + 1}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {canMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-600 hover:text-black transition-colors"
              title="Déplacer vers le haut"
            >
              ↑
            </button>
          )}
          {canMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-600 hover:text-black transition-colors"
              title="Déplacer vers le bas"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Supprimer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
          <input
            {...register(`formFields.${index}.label`)}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            placeholder="Ex: Budget"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            {...register(`formFields.${index}.type`)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black appearance-none bg-no-repeat bg-right"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            {...register(`formFields.${index}.required`)}
            type="checkbox"
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Champ obligatoire</label>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScoringRules(!showScoringRules)}
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
              {showScoringRules ? 'Masquer' : 'Configurer'} règles de scoring
            </button>
            {displayRulesCount > 0 && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {displayRulesCount} règle{displayRulesCount > 1 ? 's' : ''} configurée{displayRulesCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <ConditionalLogicEditor fieldIndex={index} fieldId={fieldId} />
      </div>

      {fieldType === 'SELECT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options (une par ligne)
          </label>
          <textarea
            {...register(`formFields.${index}.options`)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}

      {showScoringRules && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <ScoringRuleEditor
            fieldType={fieldType}
            value={scoringRulesJson ? JSON.parse(scoringRulesJson) : []}
            onChange={handleScoringRulesChange}
            onRulesChange={(count) => setCurrentScoringRulesCount(count)}
          />
        </div>
      )}
    </div>
  );
}

