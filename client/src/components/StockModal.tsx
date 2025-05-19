import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useStocks, useBuyStock } from "@/hooks/useStocks";
import { useAuth } from "@/hooks/useAuth";

interface StockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StockModal({ open, onOpenChange }: StockModalProps) {
  const { stocks, isLoading } = useStocks();
  const { user } = useAuth();
  const buyStock = useBuyStock();
  
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Filter stocks based on search term
  const filteredStocks = stocks?.filter(stock => 
    stock.name.toLowerCase().includes(search.toLowerCase()) || 
    stock.symbol.toLowerCase().includes(search.toLowerCase())
  );
  
  // Calculate total cost and remaining balance
  const totalCost = selectedStock ? (quantity * Number(selectedStock.currentPrice)) : 0;
  const userBalance = user?.balance ? Number(user.balance) : 0;
  const remainingBalance = userBalance - totalCost;
  
  // Handle stock selection
  const handleStockSelect = (stock: any) => {
    setSelectedStock(stock);
    setQuantity(1);
  };
  
  // Handle purchase
  const handlePurchase = async () => {
    if (selectedStock && quantity > 0) {
      await buyStock.mutateAsync({ 
        stockId: selectedStock.id, 
        quantity 
      });
      onOpenChange(false);
    }
  };
  
  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedStock(null);
      setQuantity(1);
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Stocks</DialogTitle>
        </DialogHeader>
        
        {/* Stock Search */}
        <div className="mb-6">
          <Label htmlFor="stock-search" className="block text-sm font-medium text-muted-foreground mb-1">
            Search for a stock
          </Label>
          <div className="relative">
            <Input 
              id="stock-search" 
              placeholder="Company name or symbol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-8"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Stock Options */}
        {!selectedStock ? (
          <div className="max-h-60 overflow-y-auto mb-6 space-y-2 rounded-lg bg-muted/50 p-2">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : filteredStocks?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No stocks found matching your search
              </div>
            ) : (
              filteredStocks?.map(stock => (
                <div 
                  key={stock.id}
                  onClick={() => handleStockSelect(stock)}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 bg-${stock.color}/10 rounded-full flex items-center justify-center mr-3`}>
                      <span className={`font-semibold text-${stock.color}`}>{stock.shortName}</span>
                    </div>
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-muted-foreground text-xs">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">₹{Number(stock.currentPrice).toLocaleString('en-IN')}</p>
                    <p className={Number(stock.change) >= 0 ? 'text-primary text-xs' : 'text-accent text-xs'}>
                      {Number(stock.change) >= 0 ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="border-t border-border pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">{selectedStock.name} ({selectedStock.symbol})</h4>
              <p className={`font-mono ${Number(selectedStock.change) >= 0 ? 'text-primary' : 'text-accent'}`}>
                ₹{Number(selectedStock.currentPrice).toLocaleString('en-IN')} 
                <span className="text-xs ml-1">
                  {Number(selectedStock.change) >= 0 ? '+' : ''}{Number(selectedStock.changePercent).toFixed(2)}%
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">
                  Quantity
                </Label>
                <Input 
                  type="number" 
                  id="quantity" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-1">
                  Estimated Cost
                </Label>
                <div className="w-full bg-muted rounded-lg p-3 text-foreground font-mono">
                  ₹{totalCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mb-6">
              <p>Available Balance: <span className="font-mono">₹{userBalance.toLocaleString('en-IN')}</span></p>
              <p>After Purchase: <span className="font-mono">₹{remainingBalance.toLocaleString('en-IN')}</span></p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {selectedStock && (
            <Button 
              onClick={handlePurchase} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
              disabled={buyStock.isPending || totalCost > userBalance || quantity <= 0}
            >
              {buyStock.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
