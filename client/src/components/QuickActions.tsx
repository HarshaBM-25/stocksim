import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, DollarSign, History } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface QuickActionsProps {
  onBuyClick: () => void;
}

// Market data for overview chart
const marketData = [
  { date: "01/21", nifty: 21700 },
  { date: "01/22", nifty: 21800 },
  { date: "01/23", nifty: 21600 },
  { date: "01/24", nifty: 21900 },
  { date: "01/25", nifty: 22000 },
  { date: "01/28", nifty: 22100 },
  { date: "01/29", nifty: 22400 },
  { date: "01/30", nifty: 22300 },
  { date: "01/31", nifty: 22200 },
  { date: "02/01", nifty: 22500 },
  { date: "02/04", nifty: 22600 },
  { date: "02/05", nifty: 22400 },
  { date: "02/06", nifty: 22550 },
  { date: "02/07", nifty: 22758 },
];

export default function QuickActions({ onBuyClick }: QuickActionsProps) {
  return (
    <Card className="glass rounded-xl shadow-xl">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            onClick={onBuyClick}
            variant="outline"
            className="w-full flex items-center justify-between bg-primary/10 hover:bg-primary/20 text-primary p-6 rounded-lg transition-all"
          >
            <span className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Buy Stocks
            </span>
            <span>→</span>
          </Button>

          <Link href="/market">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between bg-accent/10 hover:bg-accent/20 text-accent p-6 rounded-lg transition-all"
            >
              <span className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Sell Stocks
              </span>
              <span>→</span>
            </Button>
          </Link>

          <Link href="/transactions">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between bg-secondary/10 hover:bg-secondary/20 text-secondary p-6 rounded-lg transition-all"
            >
              <span className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </span>
              <span>→</span>
            </Button>
          </Link>
        </div>

        {/* Market Overview */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Market Overview</h3>

          <div className="h-[130px] w-full mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData}>
                <defs>
                  <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide={true}
                  domain={['dataMin - 200', 'dataMax + 200']}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('en-IN')}`, 'NIFTY']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="nifty" 
                  stroke="hsl(var(--secondary))" 
                  fillOpacity={1}
                  fill="url(#marketGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">NIFTY</p>
              <p className="font-medium text-primary">22,758 <span className="text-xs">+1.2%</span></p>
            </div>
            <div>
              <p className="text-muted-foreground">SENSEX</p>
              <p className="font-medium text-primary">74,674 <span className="text-xs">+0.9%</span></p>
            </div>
            <div>
              <p className="text-muted-foreground">BANK</p>
              <p className="font-medium text-accent">48,124 <span className="text-xs">-0.3%</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
