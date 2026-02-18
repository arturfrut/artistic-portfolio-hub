import { useState, useEffect } from 'react';
import { Save, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload';
import { GalleryManager } from './GalleryManager';
import { cloudinaryThumb } from './utils';
import { AnyItem, ContentType, GalleryMedia, Obra, Exposicion, Print, PressItem } from './types';

// ─── Form defaults ────────────────────────────────────────────────────────────

function defaultForm(type: ContentType, existing?: Record<string, unknown>): Record<string, unknown> {
  const base = { id: '', title: '', imageUrl: '', gallery: [] as GalleryMedia[], published: true };
  switch (type) {
    case 'obras':
      return { ...base, year: '', medium: '', dimensions: '', ...existing };
    case 'exposiciones':
      return { ...base, venue: '', location: '', date: '', description: '', ...existing };
    case 'prints': {
      const rawPrice = (existing?.price as string) || '';
      const match = rawPrice.match(/\$?([\d.,]+)\s*(ARS|USD|EUR)?/);
      const priceAmount = match?.[1] || '';
      const priceCurrency = match?.[2] || 'ARS';
      return { ...base, edition: '', size: '', price: rawPrice, priceAmount, priceCurrency, available: true, ...existing };
    }
    case 'prensa':
      return { ...base, publication: '', date: '', excerpt: '', link: '', ...existing };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemFormProps {
  contentType: ContentType;
  editItem: AnyItem | null;
  onSave: (item: AnyItem) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
  onPreview: (url: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemForm({ contentType, editItem, onSave, onCancel, saving, onPreview }: ItemFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>(
    editItem
      ? defaultForm(contentType, editItem as unknown as Record<string, unknown>)
      : defaultForm(contentType)
  );
  const [uploadingMain, setUploadingMain] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(
      editItem
        ? defaultForm(contentType, editItem as unknown as Record<string, unknown>)
        : defaultForm(contentType)
    );
    setErrors({});
  }, [editItem, contentType]);

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadImageToCloudinary(file);
      set('imageUrl', url);
    } catch {
      setErrors(prev => ({ ...prev, imageUrl: 'Error al subir imagen' }));
    } finally {
      setUploadingMain(false);
      e.target.value = '';
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title) errs.title = 'Requerido';
    if (contentType === 'obras') {
      if (!form.year) errs.year = 'Requerido';
      if (!form.medium) errs.medium = 'Requerido';
      if (!form.dimensions) errs.dimensions = 'Requerido';
    }
    if (contentType === 'exposiciones') {
      if (!form.venue) errs.venue = 'Requerido';
      if (!form.location) errs.location = 'Requerido';
      if (!form.date) errs.date = 'Requerido';
    }
    if (contentType === 'prints') {
      if (!form.imageUrl) errs.imageUrl = 'Imagen requerida';
      if (!form.edition) errs.edition = 'Requerido';
      if (!form.size) errs.size = 'Requerido';
    }
    if (contentType === 'prensa') {
      if (!form.publication) errs.publication = 'Requerido';
      if (!form.date) errs.date = 'Requerido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const formToSave = { ...form };
    if (contentType === 'prints' && formToSave.priceAmount) {
      formToSave.price = `$${formToSave.priceAmount} ${formToSave.priceCurrency || 'ARS'}`;
    }
    delete formToSave.priceAmount;
    delete formToSave.priceCurrency;

    const item = {
      ...formToSave,
      id: formToSave.id || Date.now().toString(),
      published: formToSave.published !== false,
    } as AnyItem;

    const ok = await onSave(item);
    if (ok) onCancel();
  };

  // ─── Field helper ───────────────────────────────────────────────────────────

  const field = (
    label: string,
    key: string,
    placeholder = '',
    type: 'input' | 'textarea' | 'checkbox' = 'input'
  ) => (
    <div>
      {type !== 'checkbox' && (
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">{label}</label>
      )}
      {type === 'input' && (
        <Input
          value={(form[key] as string) || ''}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          className={errors[key] ? 'border-red-400' : ''}
        />
      )}
      {type === 'textarea' && (
        <Textarea
          value={(form[key] as string) || ''}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={errors[key] ? 'border-red-400' : ''}
        />
      )}
      {type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form[key]}
            onChange={e => set(key, e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">{label}</span>
        </label>
      )}
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {field('Título', 'title', 'Nombre del item')}

      {contentType === 'obras' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {field('Año', 'year', '2025')}
            {field('Técnica', 'medium', 'Óleo sobre lienzo')}
          </div>
          {field('Dimensiones', 'dimensions', '90 x 100 cm')}
        </>
      )}

      {contentType === 'exposiciones' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {field('Galería / Venue', 'venue', 'Galería Arte Contemporáneo')}
            {field('Ubicación', 'location', 'Buenos Aires, Argentina')}
          </div>
          {field('Fecha', 'date', '2025')}
          {field('Descripción', 'description', 'Descripción de la exposición...', 'textarea')}
        </>
      )}

      {contentType === 'prints' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {field('Edición', 'edition', 'Edición limitada de 50')}
            {field('Tamaño', 'size', '60 x 40 cm')}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Precio</label>
            <div className="flex gap-2">
              <select
                value={(form.priceCurrency as string) || 'ARS'}
                onChange={e => set('priceCurrency', e.target.value)}
                className="border border-gray-700 rounded px-2 py-2 text-sm bg-gray-900 text-white w-20 flex-shrink-0"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <Input
                value={(form.priceAmount as string) || ''}
                onChange={e => set('priceAmount', e.target.value)}
                placeholder="350"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Se guardará como: {(form.priceAmount as string) ? `$${form.priceAmount} ${form.priceCurrency || 'ARS'}` : '—'}
            </p>
          </div>
          {field('Disponible', 'available', '', 'checkbox')}
        </>
      )}

      {contentType === 'prensa' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {field('Publicación', 'publication', 'Revista Ñ')}
            {field('Fecha', 'date', 'Marzo 2025')}
          </div>
          {field('Extracto', 'excerpt', 'Breve descripción...', 'textarea')}
          {field('Link', 'link', 'https://')}
        </>
      )}

      {/* Main image */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
          Imagen principal
        </label>
        <div className="flex gap-3 items-start">
          {form.imageUrl && (
            <div className="relative group">
              <img
                src={cloudinaryThumb(form.imageUrl as string)}
                alt=""
                className="w-20 h-20 object-cover rounded border cursor-zoom-in hover:opacity-80 transition"
                onClick={() => onPreview(form.imageUrl as string)}
              />
              <button
                type="button"
                onClick={() => set('imageUrl', '')}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X size={10} />
              </button>
            </div>
          )}
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2 border border-dashed rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition h-10">
              {uploadingMain ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploadingMain ? 'Subiendo...' : (form.imageUrl ? 'Cambiar imagen' : 'Subir imagen principal')}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={uploadingMain} />
          </label>
        </div>
        {errors.imageUrl && <p className="text-xs text-red-500 mt-1">{errors.imageUrl}</p>}
      </div>

      {/* Gallery */}
      <GalleryManager
        gallery={(form.gallery as GalleryMedia[]) || []}
        onChange={g => set('gallery', g)}
        onPreview={onPreview}
      />

      {/* Published */}
      <div className="pt-2 border-t">
        {field('Publicado', 'published', '', 'checkbox')}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={saving || uploadingMain} className="flex-1">
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
          {editItem ? 'Guardar cambios' : 'Agregar'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}