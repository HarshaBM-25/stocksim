import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioSummary from "@/components/PortfolioSummary";
import QuickActions from "@/components/QuickActions";
import HoldingsTable from "@/components/HoldingsTable";
import StockModal from "@/components/StockModal";
import EditStockModal from "@/components/EditStockModal";

export default function Dashboard() {
  const { user } = useAuth();
  const { balance, portfolioValue, totalInvested, holdings, isLoading } = usePortfolio();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<number | null>(null);

  const handleBuyClick = () => {
    setBuyModalOpen(true);
  };

  const handleEditHolding = (holdingId: number) => {
    setSelectedHolding(holdingId);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="glass rounded-xl p-6 md:col-span-2 shadow-xl h-80"></div>
        <div className="glass rounded-xl p-6 shadow-xl h-80"></div>
        <div className="glass rounded-xl p-6 shadow-xl md:col-span-3 h-96"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PortfolioSummary 
        portfolioValue={portfolioValue || 0} 
        initialInvestment={100000} 
        cashAvailable={balance || 0} 
        holdingsValue={portfolioValue || 0}
      />
      
      <QuickActions onBuyClick={handleBuyClick} />
      
      <HoldingsTable 
        holdings={holdings} 
        onEdit={handleEditHolding} 
      />

      <StockModal 
        open={buyModalOpen} 
        onOpenChange={setBuyModalOpen} 
      />

      {selectedHolding && (
        <EditStockModal 
          holdingId={selectedHolding}
          open={editModalOpen} 
          onOpenChange={setEditModalOpen} 
        />
      )}
    </div>
  );
}
