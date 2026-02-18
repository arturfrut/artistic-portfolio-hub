import { useState } from 'react';
import { Image as ImageIcon, Video, ChevronUp, ChevronDown, Trash2, Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload';
import { cloudinaryThumb } from './utils';
import { GalleryMedia } from './types';

interface GalleryManagerProps {
  gallery: GalleryMedia[];
  onChange: (gallery: GalleryMedia[]) => void;
  onPreview: (url: string) => void;
}

export function GalleryManager({ gallery, onChange, onPreview }: GalleryManagerProps) {
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
    } catch {
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
      <label className="block cursor-pointer">
        <div className="flex items-center gap-2 border border-dashed rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          {uploading ? 'Subiendo...' : 'Agregar imagen'}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
      </label>

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