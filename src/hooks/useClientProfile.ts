import { useState, useEffect } from 'react';
import { clientProfileService, ClientProfileData } from '@/services';

export function useClientProfile() {
  const [clientData, setClientData] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get client ID from sessionStorage
    const clientIdStr = typeof window !== 'undefined' 
      ? sessionStorage.getItem('selectedClientId')
      : null;

    if (!clientIdStr) {
      setError('No client selected');
      setLoading(false);
      return;
    }

    const clientId = parseInt(clientIdStr, 10);

    if (isNaN(clientId)) {
      setError('Invalid client ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await clientProfileService.fetchClientProfile(clientId);
        setClientData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client profile');
        setClientData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { clientData, loading, error };
}
