import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { getFileFromGitHub, updateFileOnGitHub } from '@/lib/githubApi';
import { AnyItem, ContentType } from '../types';
import { FILE_PATHS, JSON_KEYS } from '../constants';

interface Toast {
  type: 'success' | 'error';
  msg: string;
}

export function useAdminContent(token: string, activeTab: ContentType) {
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: Toast['type'], msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const file = await getFileFromGitHub(FILE_PATHS[activeTab], token);
      const data = JSON.parse(file.content);
      setItems(data[JSON_KEYS[activeTab]] || []);
    } catch (err) {
      showToast('error', 'Error cargando datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const saveItems = async (updatedItems: AnyItem[], commitMsg: string) => {
    const file = await getFileFromGitHub(FILE_PATHS[activeTab], token);
    await updateFileOnGitHub(
      FILE_PATHS[activeTab],
      JSON.stringify({ [JSON_KEYS[activeTab]]: updatedItems }, null, 2),
      file.sha,
      token,
      commitMsg
    );
    setItems(updatedItems);
  };

  const handleSaveItem = async (item: AnyItem) => {
    setSaving(true);
    try {
      const isEdit = items.some(i => i.id === item.id);
      const updatedItems = isEdit
        ? items.map(i => i.id === item.id ? item : i)
        : [...items, item];
      await saveItems(updatedItems, `${isEdit ? 'Edit' : 'Add'} ${activeTab}: ${item.title}`);
      showToast('success', isEdit ? 'Item actualizado ✓' : 'Item agregado ✓');
      return true;
    } catch (err) {
      showToast('error', 'Error guardando: ' + (err as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    setDeletingId(id);
    try {
      const updated = items.filter(i => i.id !== id);
      await saveItems(updated, `Delete from ${activeTab}`);
      showToast('success', 'Eliminado ✓');
    } catch {
      showToast('error', 'Error eliminando');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (item: AnyItem) => {
    setTogglingId(item.id);
    try {
      const updated = items.map(i =>
        i.id === item.id
          ? { ...i, published: !((i as AnyItem & { published?: boolean }).published !== false) }
          : i
      );
      await saveItems(updated, `Toggle published: ${item.title}`);
      showToast('success', 'Visibilidad actualizada ✓');
    } catch {
      showToast('error', 'Error actualizando');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    try {
      await saveItems(reordered, `Reorder ${activeTab}`);
    } catch {
      showToast('error', 'Error al reordenar');
      setItems(items);
    }
  };

  return {
    items,
    loading,
    saving,
    togglingId,
    deletingId,
    toast,
    handleSaveItem,
    handleDelete,
    handleTogglePublished,
    handleDragEnd,
  };
}