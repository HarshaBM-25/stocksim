import { useState } from "react";
import { useTransactions } from "@/hooks/usePortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const { transactions, isLoading } = useTransactions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Filter transactions by search term and type
  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = 
      tx.stock.name.toLowerCase().includes(search.toLowerCase()) || 
      tx.stock.symbol.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filter === "all" || tx.type === filter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card className="glass shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex w-full sm:w-auto space-x-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-9 bg-background/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px] bg-background/50">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy Only</SelectItem>
                  <SelectItem value="sell">Sell Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg"></div>
              ))}
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions?.map((tx) => (
                <div key={tx.id} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-${tx.stock.color}/10 rounded-full flex items-center justify-center mr-3`}>
                        <span className={`font-semibold text-${tx.stock.color}`}>{tx.stock.shortName}</span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{tx.stock.name}</p>
                          <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            tx.type === 'buy' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                          }`}>
                            {tx.type === 'buy' ? 'Buy' : 'Sell'}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(tx.transactionDate), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        {tx.type === 'buy' ? (
                          <ArrowUpIcon className="h-4 w-4 text-accent mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-primary mr-1" />
                        )}
                        <p className="font-mono font-medium">
                          {tx.type === 'buy' ? '-' : '+'}₹{Number(tx.total).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx.quantity} shares @ ₹{Number(tx.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
