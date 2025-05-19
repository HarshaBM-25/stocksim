import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Holding, Stock } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  balance: number;
  portfolioValue: number;
  totalInvested: number;
  holdings: (Holding & { stock: Stock })[];
}

export function usePortfolio() {
  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["/api/portfolio"],
  });

  return {
    balance: portfolio?.balance || 0,
    portfolioValue: portfolio?.portfolioValue || 0,
    totalInvested: portfolio?.totalInvested || 0,
    holdings: portfolio?.holdings || [],
    isLoading,
  };
}

export function useHoldings() {
  const { data: holdings, isLoading } = useQuery<(Holding & { stock: Stock })[]>({
    queryKey: ["/api/holdings"],
  });

  return {
    holdings: holdings || [],
    isLoading,
  };
}

export function useHolding(id: number) {
  const { data: holding, isLoading } = useQuery<Holding & { stock: Stock }>({
    queryKey: [`/api/holdings/${id}`],
    enabled: !!id,
  });

  return {
    holding,
    isLoading,
  };
}

export function useUpdateHolding() {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async ({ holdingId, quantity }: { holdingId: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/holdings/${holdingId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      toast({
        title: "Success",
        description: "Holding updated successfully!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update holding",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useDeleteHolding() {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async (holdingId: number) => {
      const res = await apiRequest("DELETE", `/api/holdings/${holdingId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Holding deleted and sold successfully!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete holding",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useTransactions() {
  const { data: transactions, isLoading } = useQuery<(any)[]>({
    queryKey: ["/api/transactions"],
  });

  return {
    transactions: transactions || [],
    isLoading,
  };
}
