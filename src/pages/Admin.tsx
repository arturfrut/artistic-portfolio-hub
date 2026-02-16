import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileFromGitHub, updateFileOnGitHub } from '@/lib/githubApi';
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload';
import { GalleryItem } from '@/components/gallery/GalleryGrid';

const STORAGE_KEY = 'github_token';

export default function Admin() {
  const [token, setToken] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [obras, setObras] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Check if token exists in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      loadObras(savedToken);
    }
  }, []);

  // Login
  const handleLogin = () => {
    if (token.trim()) {
      localStorage.setItem(STORAGE_KEY, token);
      setIsLoggedIn(true);
      loadObras(token);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setIsLoggedIn(false);
    setObras([]);
  };

  // Load obras from GitHub
  const loadObras = async (githubToken: string) => {
    setLoading(true);
    setError('');
    try {
      const file = await getFileFromGitHub('src/data/obras.json', githubToken);
      const data = JSON.parse(file.content);
      setObras(data.obras || []);
    } catch (err) {
      setError('Error loading obras: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Add new obra
  const handleAddObra = async () => {
    if (!title || !year || !medium || !dimensions || !imageFile) {
      setError('Por favor completá todos los campos e incluí una imagen');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(imageFile);

      // 2. Create new obra
      const newObra: GalleryItem = {
        id: Date.now().toString(),
        title,
        year,
        medium,
        dimensions,
        imageUrl,
      };

      // 3. Get current obras.json from GitHub
      const file = await getFileFromGitHub('src/data/obras.json', token);
      const data = JSON.parse(file.content);

      // 4. Add new obra
      const updatedObras = [...data.obras, newObra];

      // 5. Update GitHub
      await updateFileOnGitHub(
        'src/data/obras.json',
        JSON.stringify({ obras: updatedObras }, null, 2),
        file.sha,
        token,
        `Add obra: ${title}`
      );

      // 6. Update local state
      setObras(updatedObras);

      // 7. Clear form
      setTitle('');
      setYear('');
      setMedium('');
      setDimensions('');
      setImageFile(null);

      alert('✅ Obra agregada exitosamente!');
    } catch (err) {
      setError('Error adding obra: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub Personal Access Token
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio Admin</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Obra Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nombre de la obra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Año</label>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Técnica</label>
                <Input
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="Óleo sobre lienzo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dimensiones</label>
                <Input
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="90 x 100 cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imagen</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button
                onClick={handleAddObra}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Subiendo...' : 'Agregar Obra'}
              </Button>
            </CardContent>
          </Card>

          {/* Obras List */}
          <Card>
            <CardHeader>
              <CardTitle>Obras ({obras.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {obras.map((obra) => (
                    <div
                      key={obra.id}
                      className="border rounded p-3 flex gap-3"
                    >
                      <img
                        src={obra.imageUrl}
                        alt={obra.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{obra.title}</h3>
                        <p className="text-sm text-gray-600">
                          {obra.year} - {obra.medium}
                        </p>
                        <p className="text-sm text-gray-500">{obra.dimensions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}