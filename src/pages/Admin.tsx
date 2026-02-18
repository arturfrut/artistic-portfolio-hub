import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFileFromGitHub, updateFileOnGitHub } from '@/lib/githubApi';
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload';
import {
  Plus, Trash2, Edit2, Eye, EyeOff, LogOut, Save, X,
  Image as ImageIcon, Video, Upload, ChevronUp, ChevronDown,
  Loader2, CheckCircle, AlertCircle, Lock, GripVertical
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface GalleryMedia {
  type: 'image' | 'video';
  image?: string;
  videoUrl?: string;
}

interface BaseItem {
  id: string;
  title: string;
  imageUrl?: string;
  gallery?: GalleryMedia[];
  published?: boolean;
}

interface Obra extends BaseItem {
  year: string;
  medium: string;
  dimensions: string;
}

interface Exposicion extends BaseItem {
  venue: string;
  location: string;
  date: string;
  description?: string;
}

interface Print extends BaseItem {
  imageUrl: string;
  edition: string;
  size: string;
  price?: string;
  available: boolean;
}

interface PressItem extends BaseItem {
  publication: string;
  date: string;
  excerpt?: string;
  link?: string;
}

type ContentType = 'obras' | 'exposiciones' | 'prints' | 'prensa';
type AnyItem = Obra | Exposicion | Print | PressItem;

// ─── Constants ───────────────────────────────────────────────────────────────

const FILE_PATHS: Record<ContentType, string> = {
  obras: 'src/data/obras.json',
  exposiciones: 'src/data/exposiciones.json',
  prints: 'src/data/prints.json',
  prensa: 'src/data/prensa.json',
};

const JSON_KEYS: Record<ContentType, string> = {
  obras: 'obras',
  exposiciones: 'exposiciones',
  prints: 'prints',
  prensa: 'prensa',
};

const TAB_LABELS: Record<ContentType, string> = {
  obras: 'Obras',
  exposiciones: 'Exposiciones',
  prints: 'Prints',
  prensa: 'Prensa',
};

const STORAGE_KEY = 'portfolio_admin_enc';
const STORAGE_SALT = 'portfolio_admin_salt';
const STORAGE_IV = 'portfolio_admin_iv';

// ─── Crypto helpers ──────────────────────────────────────────────────────────

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptToken(token: string, password: string): Promise<{ enc: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
  const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(token));
  const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf)));
  return { enc: toB64(ciphertext), salt: toB64(salt), iv: toB64(iv) };
}

async function decryptToken(encB64: string, saltB64: string, ivB64: string, password: string): Promise<string> {
  const fromB64 = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
  const key = await deriveKey(password, fromB64(saltB64));
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(ivB64) },
    key,
    fromB64(encB64)
  );
  return new TextDecoder().decode(plaintext);
}

// ─── Cloudinary helpers ──────────────────────────────────────────────────────

function cloudinaryThumb(url: string, width = 150): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Insert transformation before the version segment (v123456...)
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}

// ─── Image Preview Modal ─────────────────────────────────────────────────────

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    if (!url) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [url, onClose]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
      >
        <X size={28} />
      </button>
      <img
        src={cloudinaryThumb(url, 1200)}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Gallery Manager Component ───────────────────────────────────────────────

interface GalleryManagerProps {
  gallery: GalleryMedia[];
  onChange: (gallery: GalleryMedia[]) => void;
  onPreview: (url: string) => void;
}

function GalleryManager({ gallery, onChange, onPreview }: GalleryManagerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImageToCloudinary(file);
      onChange([...gallery, { type: 'image', image: url }]);
    } catch (err) {
      setUploadError('Error al subir imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addVideo = () => {
    if (!videoUrl.trim()) return;
    onChange([...gallery, { type: 'video', videoUrl: videoUrl.trim() }]);
    setVideoUrl('');
  };

  const remove = (i: number) => onChange(gallery.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const arr = [...gallery];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Galería adicional</p>

      {/* Existing items */}
      {gallery.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {gallery.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded p-2 border">
              {item.type === 'image' ? (
                <img
                  src={cloudinaryThumb(item.image || '')}
                  alt=""
                  className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-zoom-in hover:opacity-80 transition"
                  onClick={() => item.image && onPreview(item.image)}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <Video size={16} className="text-gray-500" />
                </div>
              )}
              <span className="flex-1 text-xs truncate text-gray-600">
                {item.type === 'image' ? item.image?.split('/').pop() : item.videoUrl}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1 hover:bg-gray-200 rounded" disabled={i === 0}>
                  <ChevronUp size={12} />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="p-1 hover:bg-gray-200 rounded" disabled={i === gallery.length - 1}>
                  <ChevronDown size={12} />
                </button>
                <button type="button" onClick={() => remove(i)} className="p-1 hover:bg-red-100 text-red-500 rounded">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add image */}
      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 border border-dashed rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            {uploading ? 'Subiendo...' : 'Agregar imagen'}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      {/* Add YouTube video */}
      <div className="flex gap-2">
        <Input
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="URL de YouTube"
          className="text-sm h-8"
        />
        <Button type="button" variant="outline" size="sm" onClick={addVideo} className="h-8 px-3 whitespace-nowrap">
          <Video size={14} className="mr-1" /> Agregar
        </Button>
      </div>

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

// ─── Form defaults ────────────────────────────────────────────────────────────

function defaultForm(type: ContentType, existing?: Record<string, unknown>): Record<string, unknown> {
  const base = { id: '', title: '', imageUrl: '', gallery: [] as GalleryMedia[], published: true };
  switch (type) {
    case 'obras': return { ...base, year: '', medium: '', dimensions: '', ...existing };
    case 'exposiciones': return { ...base, venue: '', location: '', date: '', description: '', ...existing };
    case 'prints': {
      // Parse "$350 USD" → { priceAmount: "350", priceCurrency: "USD" }
      const rawPrice = (existing?.price as string) || '';
      const match = rawPrice.match(/\$?([\d.,]+)\s*(ARS|USD|EUR)?/);
      const priceAmount = match?.[1] || '';
      const priceCurrency = match?.[2] || 'ARS';
      return { ...base, edition: '', size: '', price: rawPrice, priceAmount, priceCurrency, available: true, ...existing };
    }
    case 'prensa': return { ...base, publication: '', date: '', excerpt: '', link: '', ...existing };
  }
}

// ─── Item Form ────────────────────────────────────────────────────────────────

interface ItemFormProps {
  contentType: ContentType;
  editItem: AnyItem | null;
  onSave: (item: AnyItem) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  onPreview: (url: string) => void;
}

function ItemForm({ contentType, editItem, onSave, onCancel, saving, onPreview }: ItemFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>(
    editItem
      ? defaultForm(contentType, editItem as unknown as Record<string, unknown>)
      : defaultForm(contentType)
  );
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(editItem
      ? defaultForm(contentType, editItem as unknown as Record<string, unknown>)
      : defaultForm(contentType)
    );
    setMainImageFile(null);
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
      setMainImageFile(null);
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
    // Compose price string for prints
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
    await onSave(item);
  };

  const field = (
    label: string,
    key: string,
    placeholder = '',
    type: 'input' | 'textarea' | 'select' | 'checkbox' = 'input',
    options?: { value: string; label: string }[]
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
      {type === 'select' && options && (
        <select
          value={(form[key] as string) || ''}
          onChange={e => set(key, e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
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

  return (
    <div className="space-y-4">
      {/* Title */}
      {field('Título', 'title', 'Nombre del item')}

      {/* Type-specific fields */}
      {contentType === 'obras' && (
        <div className="grid grid-cols-2 gap-3">
          {field('Año', 'year', '2025')}
          {field('Técnica', 'medium', 'Óleo sobre lienzo')}
          {field('Dimensiones', 'dimensions', '90 x 100 cm')}
        </div>
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
          {/* Price with currency selector */}
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
          <div>{field('Disponible', 'available', '', 'checkbox')}</div>
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

      {/* Published toggle */}
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

// ─── Sortable Item Wrapper ────────────────────────────────────────────────────

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

// ─── Login Screen ─────────────────────────────────────────────────────────────

interface LoginProps {
  onLogin: (token: string) => void;
}

function LoginScreen({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'password' | 'token' | 'setup'>('password');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasEncryptedToken = !!localStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    setMode(hasEncryptedToken ? 'password' : 'token');
  }, [hasEncryptedToken]);

  const handlePasswordLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const enc = localStorage.getItem(STORAGE_KEY)!;
      const salt = localStorage.getItem(STORAGE_SALT)!;
      const iv = localStorage.getItem(STORAGE_IV)!;
      const decrypted = await decryptToken(enc, salt, iv, password);
      onLogin(decrypted);
    } catch {
      setError('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenLogin = async () => {
    if (!token.trim()) return;
    setError('');

    if (setupPassword) {
      if (setupPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      setLoading(true);
      try {
        const { enc, salt, iv } = await encryptToken(token.trim(), setupPassword);
        localStorage.setItem(STORAGE_KEY, enc);
        localStorage.setItem(STORAGE_SALT, salt);
        localStorage.setItem(STORAGE_IV, iv);
      } catch {
        setError('Error al guardar');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    onLogin(token.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock size={24} className="text-white/70" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 space-y-4">
            {hasEncryptedToken && mode === 'password' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Contraseña</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                    placeholder="Tu contraseña corta"
                    className="bg-gray-800 border-gray-700 text-white"
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button onClick={handlePasswordLogin} disabled={loading} className="w-full">
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  Ingresar
                </Button>
                <button
                  onClick={() => { setMode('token'); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_SALT); localStorage.removeItem(STORAGE_IV); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition text-center"
                >
                  Usar token directamente
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">GitHub Token</label>
                  <Input
                    type="password"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="ghp_..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Opcional: proteger con contraseña corta para próximos accesos
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      value={setupPassword}
                      onChange={e => setSetupPassword(e.target.value)}
                      placeholder="Contraseña corta (ej: 1234)"
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                    {setupPassword && (
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        className="bg-gray-800 border-gray-700 text-white text-sm"
                      />
                    )}
                  </div>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button onClick={handleTokenLogin} disabled={loading} className="w-full">
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  {setupPassword ? 'Guardar y entrar' : 'Entrar sin contraseña'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const [token, setToken] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('obras');
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered); // optimistic update
    try {
      await saveItems(reordered, `Reorder ${activeTab}`);
    } catch {
      showToast('error', 'Error al reordenar');
      setItems(items); // revert on failure
    }
  };
  const [editItem, setEditItem] = useState<AnyItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [fileSha, setFileSha] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadItems = useCallback(async (tab: ContentType, githubToken: string) => {
    setLoading(true);
    try {
      const file = await getFileFromGitHub(FILE_PATHS[tab], githubToken);
      const data = JSON.parse(file.content);
      setFileSha(file.sha);
      setItems(data[JSON_KEYS[tab]] || []);
    } catch (err) {
      showToast('error', 'Error cargando datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && token) {
      loadItems(activeTab, token);
      setShowForm(false);
      setEditItem(null);
    }
  }, [activeTab, isLoggedIn, token, loadItems]);

  const handleLogin = (t: string) => {
    setToken(t);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    setItems([]);
  };

  const saveItems = async (updatedItems: AnyItem[], commitMsg: string) => {
    const file = await getFileFromGitHub(FILE_PATHS[activeTab], token);
    await updateFileOnGitHub(
      FILE_PATHS[activeTab],
      JSON.stringify({ [JSON_KEYS[activeTab]]: updatedItems }, null, 2),
      file.sha,
      token,
      commitMsg
    );
    setFileSha(file.sha);
    setItems(updatedItems);
  };

  const handleSaveItem = async (item: AnyItem) => {
    setSaving(true);
    try {
      let updatedItems: AnyItem[];
      const isEdit = editItem && items.some(i => i.id === item.id);
      if (isEdit) {
        updatedItems = items.map(i => i.id === item.id ? item : i);
      } else {
        updatedItems = [...items, item];
      }
      await saveItems(updatedItems, `${isEdit ? 'Edit' : 'Add'} ${activeTab}: ${item.title}`);
      showToast('success', isEdit ? 'Item actualizado ✓' : 'Item agregado ✓');
      setShowForm(false);
      setEditItem(null);
    } catch (err) {
      showToast('error', 'Error guardando: ' + (err as Error).message);
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
    } catch (err) {
      showToast('error', 'Error eliminando');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (item: AnyItem) => {
    setTogglingId(item.id);
    try {
      const updated = items.map(i =>
        i.id === item.id ? { ...i, published: !((i as AnyItem & { published?: boolean }).published !== false) } : i
      );
      await saveItems(updated, `Toggle published: ${item.title}`);
      showToast('success', 'Visibilidad actualizada ✓');
    } catch {
      showToast('error', 'Error actualizando');
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (item: AnyItem) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleNewItem = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
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
          {/* List panel */}
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
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

                          {item.imageUrl && (
                            <img
                              src={cloudinaryThumb(item.imageUrl)}
                              alt={item.title}
                              className="w-14 h-14 object-cover rounded flex-shrink-0 cursor-zoom-in hover:opacity-80 transition"
                              onClick={() => setPreviewUrl(item.imageUrl!)}
                            />
                          )}
                          {!item.imageUrl && (
                            <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <ImageIcon size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {activeTab === 'obras' && `${(item as Obra).year} · ${(item as Obra).medium}`}
                              {activeTab === 'exposiciones' && `${(item as Exposicion).venue} · ${(item as Exposicion).date}`}
                              {activeTab === 'prints' && `${(item as Print).size} · ${(item as Print).edition}`}
                              {activeTab === 'prensa' && `${(item as PressItem).publication} · ${(item as PressItem).date}`}
                            </p>
                            {item.gallery && item.gallery.length > 0 && (
                              <p className="text-xs text-blue-400">{item.gallery.length} en galería</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleTogglePublished(item)}
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
                                  onClick={() => handleEdit(item)}
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
                                  onClick={() => handleDelete(item.id)}
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-2">
            {showForm ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {editItem ? `Editar ${TAB_LABELS[activeTab].slice(0, -1)}` : `Nuevo en ${TAB_LABELS[activeTab]}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[80vh] overflow-y-auto">
                  <ItemForm
                    contentType={activeTab}
                    editItem={editItem}
                    onSave={handleSaveItem}
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