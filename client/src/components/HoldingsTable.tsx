import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSellStock } from "@/hooks/useStocks";
import { Search, Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface HoldingsTableProps {
  holdings: any[];
  onEdit: (holdingId: number) => void;
}

export default function HoldingsTable({ holdings, onEdit }: HoldingsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const sellStock = useSellStock();

  const filteredHoldings = holdings.filter(holding => 
    holding.stock.name.toLowerCase().includes(search.toLowerCase()) || 
    holding.stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSellClick = (holding: any) => {
    setSelectedHolding(holding);
    setSellDialogOpen(true);
  };

  const handleSellConfirm = async () => {
    if (selectedHolding) {
      try {
        console.log("Selling stock with holdingId:", selectedHolding.id, "quantity:", selectedHolding.quantity);
        await sellStock.mutateAsync({
          holdingId: selectedHolding.id,
          quantity: selectedHolding.quantity
        });
        setSellDialogOpen(false);
      } catch (error) {
        console.error("Error selling stock:", error);
      }
    }
  };

  return (
    <Card className="glass rounded-xl shadow-xl md:col-span-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Holdings</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stocks..." 
                className="pl-9 bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {filteredHoldings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No holdings found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Purchase some stocks to see them here
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-3 pl-6 pr-3 text-left">Stock</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Avg. Price</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">Value</th>
                  <th className="py-3 px-3 text-right">Return</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredHoldings.map((holding) => {
                  const currentValue = Number(holding.stock.currentPrice) * holding.quantity;
                  const investedValue = Number(holding.averagePrice) * holding.quantity;
                  const profit = currentValue - investedValue;
                  const profitPercentage = (profit / investedValue) * 100;
                  
                  return (
                    <tr key={holding.id} className="hover:bg-muted/50 transition-colors text-sm">
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 bg-${holding.stock.color}/10 rounded-full flex items-center justify-center mr-3`}>
                            <span className={`font-semibold text-${holding.stock.color}`}>{holding.stock.shortName}</span>
                          </div>
                          <div>
                            <p className="font-medium">{holding.stock.name}</p>
                            <p className="text-muted-foreground text-xs">{holding.stock.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right font-mono">{holding.quantity}</td>
                      <td className="py-4 px-3 text-right font-mono">₹{Number(holding.averagePrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 text-right font-mono">₹{Number(holding.stock.currentPrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 text-right font-mono">₹{currentValue.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 text-right">
                        <span className={`font-medium ${profit >= 0 ? 'text-primary' : 'text-accent'}`}>
                          {profit >= 0 ? '+' : ''}₹{Math.abs(profit).toLocaleString('en-IN')} ({profitPercentage.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEdit(holding.id)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleSellClick(holding)}
                            title="Sell All"
                            className="ml-1"
                          >
                            Sell
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <AlertDialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
          <AlertDialogContent className="glass">
            <AlertDialogHeader>
              <AlertDialogTitle>Sell Stock</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sell all shares of {selectedHolding?.stock?.name}? This will sell {selectedHolding?.quantity} shares at the current price of ₹{selectedHolding?.stock?.currentPrice}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSellConfirm} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {sellStock.isPending ? "Selling..." : "Sell All Shares"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
