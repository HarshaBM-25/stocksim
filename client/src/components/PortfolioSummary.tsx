import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Generate sample portfolio data
const generatePortfolioData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: 100000 + Math.random() * 15000 * Math.sin(i / 5)
    });
  }
  return data;
};

interface PortfolioSummaryProps {
  portfolioValue: number;
  initialInvestment: number;
  cashAvailable: number;
  holdingsValue: number;
}

export default function PortfolioSummary({
  portfolioValue,
  initialInvestment,
  cashAvailable,
  holdingsValue
}: PortfolioSummaryProps) {
  const portfolioData = generatePortfolioData();
  
  // Calculate profit/loss
  const profitLoss = portfolioValue - initialInvestment;
  const profitLossPercentage = (profitLoss / initialInvestment) * 100;
  
  return (
    <Card className="glass rounded-xl shadow-xl md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Portfolio Summary</CardTitle>
          <div className={`text-sm px-3 py-1 rounded-full ${
            profitLoss >= 0 
              ? "bg-primary/10 text-primary" 
              : "bg-accent/10 text-accent"
          }`}>
            {profitLoss >= 0 ? "+" : ""}
            ₹{Math.abs(profitLoss).toLocaleString('en-IN')} ({profitLossPercentage.toFixed(2)}%)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full mb-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                hide={true}
                domain={['dataMin - 5000', 'dataMax + 5000']}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  });
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#portfolioGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg opacity-50 pointer-events-none"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Total Value</p>
            <p className="text-lg font-mono font-semibold">₹{portfolioValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Initial Investment</p>
            <p className="text-lg font-mono font-semibold">₹{initialInvestment.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Cash Available</p>
            <p className="text-lg font-mono font-semibold">₹{cashAvailable.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Holdings Value</p>
            <p className="text-lg font-mono font-semibold">₹{holdingsValue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
