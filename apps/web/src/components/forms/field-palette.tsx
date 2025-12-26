'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface FieldType {
  value: string;
  label: string;
  icon: string;
}

const fieldTypes: FieldType[] = [
  { value: 'TEXT', label: 'Texte', icon: '📝' },
  { value: 'EMAIL', label: 'Email', icon: '📧' },
  { value: 'PHONE', label: 'Téléphone', icon: '📞' },
  { value: 'SELECT', label: 'Liste déroulante', icon: '🎯' },
  { value: 'RADIO', label: 'Boutons radio', icon: '🔘' },
  { value: 'CHECKBOX', label: 'Cases à cocher', icon: '☑️' },
  { value: 'TEXTAREA', label: 'Zone de texte', icon: '📋' },
  { value: 'NUMBER', label: 'Nombre', icon: '🔢' },
  { value: 'DATE', label: 'Date', icon: '📅' },
  { value: 'BUDGET', label: 'Budget (€)', icon: '💰' },
  { value: 'RATING', label: 'Note (étoiles)', icon: '⭐' },
];

interface DraggableFieldItemProps {
  field: FieldType;
}

function DraggableFieldItem({ field }: DraggableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${field.value}`,
    data: {
      type: 'field',
      fieldType: field.value,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
    >
      <span className="text-xl">{field.icon}</span>
      <span className="text-sm font-medium text-gray-700">{field.label}</span>
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Glisser dans le canvas</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <DraggableFieldItem key={field.value} field={field} />
        ))}
      </div>
    </div>
  );
}

