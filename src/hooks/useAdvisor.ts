import { useState, useEffect } from "react";
import { advisorService, type AdvisorData } from "@/services";

interface UseAdvisorResult {
  advisorData: AdvisorData | null;
  loading: boolean;
  error: string | null;
}

export function useAdvisor(advisorId: number | null): UseAdvisorResult {
  const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!advisorId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await advisorService.fetchAdvisor(advisorId);
        setAdvisorData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load advisor data"
        );
        setAdvisorData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [advisorId]);

  return { advisorData, loading, error };
}
