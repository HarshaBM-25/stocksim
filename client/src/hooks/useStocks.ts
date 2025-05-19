import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Stock } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useStocks() {
  const { data: stocks, isLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  return {
    stocks,
    isLoading,
  };
}

export function useStock(id: number) {
  const { data: stock, isLoading } = useQuery<Stock>({
    queryKey: [`/api/stocks/${id}`],
    enabled: !!id,
  });

  return {
    stock,
    isLoading,
  };
}

export function useBuyStock() {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async ({ stockId, quantity }: { stockId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/stocks/buy", { stockId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Stock purchased successfully!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to buy stock",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useSellStock() {
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async ({ holdingId, quantity }: { holdingId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/stocks/sell", { holdingId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Stock sold successfully!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sell stock",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
