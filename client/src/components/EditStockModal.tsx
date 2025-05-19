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
import { useHolding, useUpdateHolding, useDeleteHolding } from "@/hooks/usePortfolio";

interface EditStockModalProps {
  holdingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStockModal({ holdingId, open, onOpenChange }: EditStockModalProps) {
  const { holding, isLoading } = useHolding(holdingId);
  const updateHolding = useUpdateHolding();
  const deleteHolding = useDeleteHolding();
  
  const [quantity, setQuantity] = useState(0);
  
  useEffect(() => {
    if (holding) {
      setQuantity(holding.quantity);
    }
  }, [holding]);
  
  const handleUpdate = async () => {
    if (holding && quantity > 0) {
      await updateHolding.mutateAsync({
        holdingId: holding.id,
        quantity
      });
      onOpenChange(false);
    }
  };
  
  const handleDelete = async () => {
    if (holding) {
      await deleteHolding.mutateAsync(holding.id);
      onOpenChange(false);
    }
  };
  
  if (isLoading || !holding) {
    return null;
  }
  
  // Calculate values
  const currentStockPrice = Number(holding.stock.currentPrice);
  const totalValue = quantity * currentStockPrice;
  const totalInvested = quantity * Number(holding.averagePrice);
  const profitLoss = totalValue - totalInvested;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Holding</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 bg-${holding.stock.color}/10 rounded-full flex items-center justify-center mr-3`}>
              <span className={`font-semibold text-${holding.stock.color}`}>{holding.stock.shortName}</span>
            </div>
            <div>
              <h4 className="font-medium text-lg">{holding.stock.name}</h4>
              <p className="text-muted-foreground text-sm">
                {holding.stock.symbol} • Current Price: ₹{currentStockPrice.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="edit-quantity" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantity
            </Label>
            <Input 
              type="number" 
              id="edit-quantity" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
              Average Purchase Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
              <Input 
                type="text"
                value={Number(holding.averagePrice).toLocaleString('en-IN')}
                readOnly
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="font-mono text-lg">₹{totalValue.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
              <p className={`font-mono text-lg ${profitLoss >= 0 ? 'text-primary' : 'text-accent'}`}>
                {profitLoss >= 0 ? '+' : ''}₹{Math.abs(profitLoss).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleUpdate}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
              disabled={updateHolding.isPending || quantity <= 0 || quantity === holding.quantity}
            >
              {updateHolding.isPending ? "Updating..." : "Update"}
            </Button>
            <Button 
              onClick={handleDelete}
              className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent"
              disabled={deleteHolding.isPending}
            >
              {deleteHolding.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
