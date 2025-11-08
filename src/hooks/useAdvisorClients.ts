import { useState, useEffect } from "react";
import { clientService, type ClientData } from "@/services";

interface UseAdvisorClientsResult {
  clients: ClientData[] | null;
  clientOptions: { value: string; label: string }[];
  loading: boolean;
  error: string | null;
}

export function useAdvisorClients(
  advisorId: number | null,
  appType?: string
): UseAdvisorClientsResult {
  const [clients, setClients] = useState<ClientData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!advisorId) {
      setClients(null);
      return;
    }

    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await clientService.fetchAdvisorClients(advisorId, appType);
        setClients(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load clients"
        );
        setClients(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [advisorId, appType]);

  const clientOptions = clients?.map((client) => ({
    value: client.id.toString(),
    label: `${client.firstName || ""} ${client.lastName || ""}`.trim() || client.email,
  })) || [];

  return { clients, clientOptions, loading, error };
}
