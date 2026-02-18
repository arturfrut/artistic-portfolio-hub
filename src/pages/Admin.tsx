import { useState, useEffect } from 'react';
import { Plus, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminContent } from '@/components/admin/hooks/useAdminContent';
import { TAB_LABELS } from '@/components/admin/constants';
import {
  LoginScreen,
  ImagePreviewModal,
  ItemForm,
  SortableItemList,
} from '@/components/admin';
import type { AnyItem, ContentType } from '@/components/admin';

export default function Admin() {
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('obras');
  const [editItem, setEditItem] = useState<AnyItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    items, loading, saving, togglingId, deletingId, toast,
    handleSaveItem, handleDelete, handleTogglePublished, handleDragEnd,
  } = useAdminContent(token, activeTab);

  // Reset form when tab changes
  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
  }, [activeTab]);

  const handleLogin = (t: string) => { setToken(t); setIsLoggedIn(true); };
  const handleLogout = () => { setToken(''); setIsLoggedIn(false); };
  const handleEdit = (item: AnyItem) => { setEditItem(item); setShowForm(true); };
  const handleNewItem = () => { setEditItem(null); setShowForm(true); };
  const handleCancelForm = () => { setShowForm(false); setEditItem(null); };

  const handleSave = async (item: AnyItem) => {
    const ok = await handleSaveItem(item);
    if (ok) handleCancelForm();
    return ok;
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 text-lg tracking-tight">Portfolio Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-gray-900">
            <LogOut size={16} className="mr-1" /> Salir
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg border p-1 mb-6 w-fit">
          {(Object.keys(TAB_LABELS) as ContentType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {TAB_LABELS[activeTab]}
                    <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
                  </CardTitle>
                  <Button size="sm" onClick={handleNewItem}>
                    <Plus size={16} className="mr-1" /> Nuevo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <Loader2 size={24} className="animate-spin mr-2" /> Cargando...
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-center text-gray-400 py-12 text-sm">No hay items aún</p>
                ) : (
                  <SortableItemList
                    items={items}
                    contentType={activeTab}
                    togglingId={togglingId}
                    deletingId={deletingId}
                    onPreview={setPreviewUrl}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={handleTogglePublished}
                    onDragEnd={handleDragEnd}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {showForm ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {editItem ? `Editar` : `Nuevo en ${TAB_LABELS[activeTab]}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[80vh] overflow-y-auto">
                  <ItemForm
                    contentType={activeTab}
                    editItem={editItem}
                    onSave={handleSave}
                    onCancel={handleCancelForm}
                    saving={saving}
                    onPreview={setPreviewUrl}
                  />
                </CardContent>
              </Card>
            ) : (
              <div
                onClick={handleNewItem}
                className="h-full min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer transition-all"
              >
                <Plus size={32} />
                <p className="text-sm font-medium">Agregar nuevo item</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}