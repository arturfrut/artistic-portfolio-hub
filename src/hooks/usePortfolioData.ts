import { useState, useEffect } from 'react';

export function usePortfolioData<T>(path: string, key: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/data/${path}`, { cache: 'no-cache' })
      .then(r => r.json())
      .then(json => setData(json[key] || []))
      .finally(() => setLoading(false));
  }, [path, key]);

  return { data, loading };
}