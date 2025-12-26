'use client';

import { useFormContext } from 'react-hook-form';

interface FormTemplate {
  name: string;
  description: string;
  fields: Array<{
    label: string;
    type: string;
    required: boolean;
    order: number;
    options?: string;
    scoringRulesJson?: string;
    weight?: number;
  }>;
}

const templates: FormTemplate[] = [
  {
    name: 'Qualification High-Ticket',
    description: 'Template pour qualifier des leads high-ticket',
    fields: [
      {
        label: 'Email',
        type: 'EMAIL',
        required: true,
        order: 0,
      },
      {
        label: 'Prénom',
        type: 'TEXT',
        required: true,
        order: 1,
      },
      {
        label: 'Nom',
        type: 'TEXT',
        required: true,
        order: 2,
      },
      {
        label: 'Téléphone',
        type: 'PHONE',
        required: true,
        order: 3,
      },
      {
        label: 'Budget disponible',
        type: 'NUMBER',
        required: true,
        order: 4,
        scoringRulesJson: JSON.stringify([
          { condition: 'greater_than', value: 10000, score: 30, weight: 3 },
          { condition: 'between', min: 5000, max: 10000, score: 20, weight: 2 },
          { condition: 'less_than', value: 5000, score: 10, weight: 1 },
        ]),
        weight: 3,
      },
      {
        label: 'Secteur d\'activité',
        type: 'SELECT',
        required: true,
        order: 5,
        options: 'E-commerce\nSaaS\nCoaching\nFormation\nAutre',
        scoringRulesJson: JSON.stringify([
          { condition: 'in', values: ['E-commerce', 'SaaS'], score: 25, weight: 2 },
          { condition: 'in', values: ['Coaching', 'Formation'], score: 15, weight: 1 },
          { condition: 'equals', value: 'Autre', score: 5, weight: 1 },
        ]),
        weight: 2,
      },
      {
        label: 'Urgence',
        type: 'SELECT',
        required: true,
        order: 6,
        options: 'Immédiat (sous 1 mois)\nCourt terme (1-3 mois)\nMoyen terme (3-6 mois)\nLong terme (6+ mois)',
        scoringRulesJson: JSON.stringify([
          { condition: 'equals', value: 'Immédiat (sous 1 mois)', score: 25, weight: 2 },
          { condition: 'equals', value: 'Court terme (1-3 mois)', score: 15, weight: 1 },
          { condition: 'equals', value: 'Moyen terme (3-6 mois)', score: 10, weight: 1 },
          { condition: 'equals', value: 'Long terme (6+ mois)', score: 5, weight: 1 },
        ]),
        weight: 2,
      },
      {
        label: 'Objectif principal',
        type: 'TEXTAREA',
        required: false,
        order: 7,
      },
    ],
  },
  {
    name: 'Qualification Simple',
    description: 'Template basique pour qualification rapide',
    fields: [
      {
        label: 'Email',
        type: 'EMAIL',
        required: true,
        order: 0,
      },
      {
        label: 'Nom complet',
        type: 'TEXT',
        required: true,
        order: 1,
      },
      {
        label: 'Téléphone',
        type: 'PHONE',
        required: false,
        order: 2,
      },
      {
        label: 'Budget',
        type: 'NUMBER',
        required: true,
        order: 3,
        scoringRulesJson: JSON.stringify([
          { condition: 'greater_than', value: 5000, score: 50, weight: 2 },
          { condition: 'less_than', value: 5000, score: 20, weight: 1 },
        ]),
        weight: 2,
      },
    ],
  },
  {
    name: 'Formulaire de Contact',
    description: 'Template simple pour collecter des contacts',
    fields: [
      {
        label: 'Email',
        type: 'EMAIL',
        required: true,
        order: 0,
      },
      {
        label: 'Prénom',
        type: 'TEXT',
        required: true,
        order: 1,
      },
      {
        label: 'Nom',
        type: 'TEXT',
        required: true,
        order: 2,
      },
      {
        label: 'Message',
        type: 'TEXTAREA',
        required: false,
        order: 3,
      },
    ],
  },
];

interface FormTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void;
}

export function FormTemplates({ onSelectTemplate }: FormTemplatesProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Templates</h3>
      {templates.map((template, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelectTemplate(template)}
          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-gray-900">{template.name}</div>
          <div className="text-xs text-gray-500 mt-1">{template.description}</div>
          <div className="text-xs text-gray-600 mt-1">{template.fields.length} champs</div>
        </button>
      ))}
    </div>
  );
}

