'use client';

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldEditor } from './form-field-editor';
// useFieldArray supprimé car fields sont passés en props

interface DraggableFieldListProps {
  onRemove: (index: number) => void;
  onAddField?: (fieldType: string) => void;
  fields: any[];
}

export function DraggableFieldList({ onRemove, onAddField, fields }: DraggableFieldListProps) {
  // Note: Le DndContext et le réordonnancement sont gérés par le composant parent (NewFormPage)

  return (
    <SortableContext items={fields.map((f: any, idx: number) => f.id || `field-${idx}`)} strategy={verticalListSortingStrategy}>
      <div className="space-y-4">
        {fields.map((field: any, index: number) => (
          <SortableFieldItem
            key={field.id || `field-${index}`}
            id={field.id || `field-${index}`}
            index={index}
            onRemove={() => onRemove(index)}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
          />
        ))}
      </div>
    </SortableContext>
  );
}

interface SortableFieldItemProps {
  id: string;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableFieldItem({
  id,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing">
        <div {...attributes} {...listeners} className="text-gray-600 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>
      <FormFieldEditor
        index={index}
        onRemove={onRemove}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </div>
  );
}

