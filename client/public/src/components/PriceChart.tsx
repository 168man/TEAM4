import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush, ReferenceArea } from "recharts";
import { Loader2 } from "lucide-react";

interface ChartDataPoint {
  date: string;
  actual: number | null;
  onchain: number | null;
  lstm: number | null;
  valuation_score: number | null;
  signal: string | null;
}

interface ATHEvent {
  date: string;
  price: number;
  label: string;
}

interface ChartSummary {
  ath_events: ATHEvent[];
  start_date: string;
  end_date: string;
  current_price: number;
}

export default function PriceChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [summary, setSummary] = useState<ChartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{left: number, right: number} | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Load chart data
        const dataResponse = await fetch('chart_data.json');
        if (!dataResponse.ok) throw new Error('Failed to load chart data');
        const data = await dataResponse.json();
        
        // Load summary
        const summaryResponse = await fetch('chart_summary.json');
        if (!summaryResponse.ok) throw new Error('Failed to load summary');
        const summaryData = await summaryResponse.json();
        
        // Filter and clean data for logarithmic scale
        const cleanedData = data.map((point: ChartDataPoint) => ({
          ...point,
          actual: point.actual && point.actual > 0 ? point.actual : null,
          onchain: point.onchain && point.onchain > 0 ? point.onchain : null,
          lstm: point.lstm && point.lstm > 0 ? point.lstm : null,
        }));
        
        setChartData(cleanedData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading historical data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12">
          <div className="text-center text-destructive">
            <p>Error loading chart data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{formatFullDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value ? `$${entry.value.toLocaleString()}` : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Historical Price & Predictions (2010 - 2025)</CardTitle>
        <CardDescription>
          Bitcoin price history with predictions from On-Chain and LSTM models. 
          Vertical lines mark major all-time highs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
                minTickGap={100}
              />
              <YAxis 
                scale="log"
                domain={[0.01, 150000]}
                tickFormatter={formatPrice}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                allowDataOverflow={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              
              {/* ATH Reference Lines */}
              {summary?.ath_events.map((ath, idx) => (
                <ReferenceLine
                  key={idx}
                  x={ath.date}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{ 
                    value: ath.label, 
                    position: 'top',
                    fill: 'hsl(var(--destructive))',
                    fontSize: 12
                  }}
                />
              ))}
              
              {/* Actual Price */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Price"
                stroke="#F7931A"
                strokeWidth={3}
                dot={false}
                connectNulls
              />
              
              {/* On-Chain Prediction */}
              <Line
                type="monotone"
                dataKey="onchain"
                name="On-Chain Fair Value"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray="5 5"
              />
              
              {/* LSTM Prediction */}
              <Line
                type="monotone"
                dataKey="lstm"
                name="LSTM Prediction"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray="3 3"
              />
              
              {/* Brush for zooming */}
              <Brush
                dataKey="date"
                height={30}
                stroke="#F7931A"
                fill="rgba(247, 147, 26, 0.1)"
                tickFormatter={formatDate}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Data Range</p>
            <p className="text-sm font-medium">
              {summary ? `${formatDate(summary.start_date)} - ${formatDate(summary.end_date)}` : 'Loading...'}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Data Points</p>
            <p className="text-sm font-medium">{chartData.length.toLocaleString()} weeks</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Chart Type</p>
            <p className="text-sm font-medium">Logarithmic Scale</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> The chart uses a logarithmic scale to better visualize Bitcoin's exponential growth from $0.06 (2010) to $87,000+ (2025). 
            The On-Chain fair value represents the estimated intrinsic value based on MVRV ratio, while LSTM shows pattern-based predictions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
