import { useState } from "react";
import { useStocks, useBuyStock } from "@/hooks/useStocks";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export default function Market() {
  const { stocks, isLoading } = useStocks();
  const { user } = useAuth();
  const buyStock = useBuyStock();
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredStocks = stocks?.filter(stock => 
    stock.name.toLowerCase().includes(search.toLowerCase()) || 
    stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockClick = (stock: any) => {
    setSelectedStock(stock);
    setQuantity(1);
    setDialogOpen(true);
  };

  const handleBuy = async () => {
    if (selectedStock && quantity > 0) {
      await buyStock.mutateAsync({ 
        stockId: selectedStock.id, 
        quantity 
      });
      setDialogOpen(false);
    }
  };

  const totalCost = selectedStock ? (quantity * Number(selectedStock.currentPrice)) : 0;
  const userBalance = user?.balance ? Number(user.balance) : 0;
  const remainingBalance = userBalance - totalCost;

  return (
    <div className="space-y-6">
      <Card className="glass shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Market</CardTitle>
            <div className="relative w-full max-w-sm">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stocks..." 
                className="pl-9 bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted p-6 rounded-lg h-24"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks?.map(stock => (
                <div 
                  key={stock.id}
                  onClick={() => handleStockClick(stock)}
                  className="bg-primary/5 hover:bg-primary/10 border border-border/50 rounded-lg p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 bg-${stock.color}/10 rounded-full flex items-center justify-center mr-3`}>
                        <span className={`font-semibold text-${stock.color}`}>{stock.shortName}</span>
                      </div>
                      <div>
                        <p className="font-medium">{stock.name}</p>
                        <p className="text-muted-foreground text-xs">{stock.symbol}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono">₹{Number(stock.currentPrice).toLocaleString('en-IN')}</span>
                    <div className="flex items-center">
                      {Number(stock.change) >= 0 ? (
                        <TrendingUpIcon className="h-4 w-4 mr-1 text-primary" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 mr-1 text-accent" />
                      )}
                      <span className={Number(stock.change) >= 0 ? 'text-primary' : 'text-accent'}>
                        {Number(stock.change) >= 0 ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Stock</DialogTitle>
            <DialogDescription>
              Purchase shares of {selectedStock?.name} ({selectedStock?.symbol})
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{selectedStock?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedStock?.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-mono">₹{selectedStock ? Number(selectedStock.currentPrice).toLocaleString('en-IN') : 0}</p>
              <p className={Number(selectedStock?.change || 0) >= 0 ? 'text-primary text-xs' : 'text-accent text-xs'}>
                {Number(selectedStock?.change || 0) >= 0 ? '+' : ''}{selectedStock ? Number(selectedStock.changePercent).toFixed(2) : 0}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min={1} 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <div className="bg-muted p-3 rounded-md font-mono">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <p>Available Balance: <span className="font-mono">₹{userBalance.toLocaleString('en-IN')}</span></p>
            <p>After Purchase: <span className="font-mono">₹{remainingBalance.toLocaleString('en-IN')}</span></p>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={handleBuy} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={buyStock.isPending || totalCost > userBalance || quantity <= 0}
            >
              {buyStock.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
