import { useEffect, useState } from 'react';
import { getJson } from './client.js';

export type ResourceStatus = 'loading' | 'ready' | 'error';

export function useJsonResource<T>(path: string) {
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getJson<T>(path)
      .then((body) => {
        if (!active) return;
        setData(body);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [path]);

  return { status, data };
}
