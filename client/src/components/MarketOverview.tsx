import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

// Sample market data
const marketData = {
  nifty: [
    { time: "9:15", value: 22100 },
    { time: "10:00", value: 22150 },
    { time: "11:00", value: 22220 },
    { time: "12:00", value: 22190 },
    { time: "13:00", value: 22300 },
    { time: "14:00", value: 22340 },
    { time: "15:00", value: 22400 },
    { time: "15:30", value: 22758 },
  ],
  sensex: [
    { time: "9:15", value: 73800 },
    { time: "10:00", value: 73950 },
    { time: "11:00", value: 74100 },
    { time: "12:00", value: 74050 },
    { time: "13:00", value: 74200 },
    { time: "14:00", value: 74350 },
    { time: "15:00", value: 74500 },
    { time: "15:30", value: 74674 },
  ],
  bank: [
    { time: "9:15", value: 48500 },
    { time: "10:00", value: 48400 },
    { time: "11:00", value: 48350 },
    { time: "12:00", value: 48250 },
    { time: "13:00", value: 48300 },
    { time: "14:00", value: 48200 },
    { time: "15:00", value: 48150 },
    { time: "15:30", value: 48124 },
  ],
};

export default function MarketOverview() {
  const [activeTab, setActiveTab] = useState("nifty");
  
  // Calculate changes for indexes
  const niftyChange = 1.2;
  const sensexChange = 0.9;
  const bankChange = -0.3;
  
  return (
    <Card className="glass rounded-xl shadow-xl">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nifty" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="nifty">NIFTY</TabsTrigger>
            <TabsTrigger value="sensex">SENSEX</TabsTrigger>
            <TabsTrigger value="bank">BANK</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nifty">
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData.nifty}>
                  <defs>
                    <linearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'NIFTY']}
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
                    fill="url(#niftyGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-semibold font-mono">22,758</p>
              </div>
              <div className={`flex items-center ${niftyChange >= 0 ? 'text-primary' : 'text-accent'}`}>
                {niftyChange >= 0 ? (
                  <ArrowUpIcon className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-5 w-5" />
                )}
                <span className="text-lg font-medium">
                  {niftyChange >= 0 ? '+' : ''}{niftyChange}%
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sensex">
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData.sensex}>
                  <defs>
                    <linearGradient id="sensexGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'SENSEX']}
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
                    fill="url(#sensexGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-semibold font-mono">74,674</p>
              </div>
              <div className={`flex items-center ${sensexChange >= 0 ? 'text-primary' : 'text-accent'}`}>
                {sensexChange >= 0 ? (
                  <ArrowUpIcon className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-5 w-5" />
                )}
                <span className="text-lg font-medium">
                  {sensexChange >= 0 ? '+' : ''}{sensexChange}%
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bank">
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData.bank}>
                  <defs>
                    <linearGradient id="bankGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'BANK']}
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
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1}
                    fill="url(#bankGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-semibold font-mono">48,124</p>
              </div>
              <div className={`flex items-center ${bankChange >= 0 ? 'text-primary' : 'text-accent'}`}>
                {bankChange >= 0 ? (
                  <ArrowUpIcon className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-5 w-5" />
                )}
                <span className="text-lg font-medium">
                  {bankChange >= 0 ? '+' : ''}{bankChange}%
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
