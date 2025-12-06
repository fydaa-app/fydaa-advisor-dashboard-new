import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { AdvisorData, advisorService } from "@/services/advisorService";
import { useAuth } from "@/context/AuthContext";

// Use AdvisorData directly instead of extending it with no additional properties
export type Advisor = AdvisorData;

interface UseAdvisorResult {
  advisor: Advisor | null;
  loading: boolean;
  error: string | null;
}

export function useAdvisor(): UseAdvisorResult {
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAdvisorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const AUTH_TOKEN = Cookies.get("authToken");
        if (!AUTH_TOKEN) {
          throw new Error("Authentication token not found");
        }

        if (!user?.id) {
          throw new Error("User ID not found");
        }

        // Fetch real advisor data using the user ID
        const advisorData = await advisorService.fetchAdvisor(user.id);
        setAdvisor(advisorData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load advisor data"
        );
        setAdvisor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisorData();
  }, [user?.id]);

  return { advisor, loading, error };
}
