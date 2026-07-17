import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Eye, EyeOff, Edit2, Trash2, GripVertical,
  Image as ImageIcon, Loader2
} from 'lucide-react';
import { cloudinaryThumb } from './utils';
import { AnyItem, ContentType, Obra, Exposicion, Print, PressItem } from './types';

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

interface SortableItemProps {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

// ─── Item subtitle helper ─────────────────────────────────────────────────────

function itemSubtitle(item: AnyItem, contentType: ContentType): string {
  switch (contentType) {
    case 'obras': return `${(item as Obra).year} · ${(item as Obra).medium}`;
    case 'exposiciones': return `${(item as Exposicion).venue} · ${(item as Exposicion).date}`;
    case 'prints': return `${(item as Print).size} · ${(item as Print).edition}`;
    case 'prensa': return `${(item as PressItem).publication} · ${(item as PressItem).date}`;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SortableItemListProps {
  items: AnyItem[];
  contentType: ContentType;
  togglingId: string | null;
  deletingId: string | null;
  onPreview: (url: string) => void;
  onEdit: (item: AnyItem) => void;
  onDelete: (item: AnyItem) => void;
  onTogglePublished: (item: AnyItem) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SortableItemList({
  items,
  contentType,
  togglingId,
  deletingId,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublished,
  onDragEnd,
}: SortableItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          <TooltipProvider delayDuration={300}>
            {items.map(item => {
              const isPublished = (item as AnyItem & { published?: boolean }).published !== false;
              const isToggling = togglingId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <SortableItem key={item.id} id={item.id}>
                  {(dragHandleProps) => (
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                        !isPublished ? 'opacity-50 bg-gray-50' : 'bg-white'
                      }`}
                    >
                      {/* Drag handle */}
                      <div
                        {...dragHandleProps}
                        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                      >
                        <GripVertical size={16} />
                      </div>

                      {/* Thumbnail */}
                      {item.imageUrl ? (
                        <img
                          src={cloudinaryThumb(item.imageUrl)}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded flex-shrink-0 cursor-zoom-in hover:opacity-80 transition"
                          onClick={() => onPreview(item.imageUrl!)}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 truncate">{itemSubtitle(item, contentType)}</p>
                        {item.gallery && item.gallery.length > 0 && (
                          <p className="text-xs text-blue-400">{item.gallery.length} en galería</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onTogglePublished(item)}
                              disabled={isToggling}
                              className={`p-2 rounded hover:bg-gray-100 transition ${isPublished ? 'text-green-500' : 'text-gray-400'}`}
                            >
                              {isToggling
                                ? <Loader2 size={16} className="animate-spin" />
                                : isPublished ? <Eye size={16} /> : <EyeOff size={16} />
                              }
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isPublished ? 'Visible en el sitio — click para ocultar' : 'Oculto — click para publicar'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onEdit(item)}
                              className="p-2 rounded hover:bg-gray-100 transition text-gray-500"
                            >
                              <Edit2 size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Editar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onDelete(item)}
                              disabled={isDeleting}
                              className="p-2 rounded hover:bg-red-50 transition text-gray-400 hover:text-red-500"
                            >
                              {isDeleting
                                ? <Loader2 size={16} className="animate-spin text-red-400" />
                                : <Trash2 size={16} />
                              }
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Eliminar</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </SortableItem>
              );
            })}
          </TooltipProvider>
        </div>
      </SortableContext>
    </DndContext>
  );
}