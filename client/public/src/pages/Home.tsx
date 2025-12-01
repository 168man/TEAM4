import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Bitcoin, BarChart3, Brain, LineChart } from "lucide-react";
import PriceChart from '@/components/PriceChart';
import Options3DSurface from '@/components/Options3DSurface';
import InfoCard from "@/components/InfoCard";
import PredictionTable from "@/components/PredictionTable";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface PredictionData {
  method: string;
  current_price: number;
  prediction_1d: number;
  prediction_7d: number;
  prediction_30d: number;
  signal: string;
  confidence: string;
  details?: any;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(87434.55);

  // Auto-refresh every 3 hours (10800000 ms)
  useEffect(() => {
    // Load options data and update predictions
    const loadData = async () => {
      try {
        const optionsRes = await fetch('options_data.json');
        const optionsData = await optionsRes.json();
        
        const currentBtcPrice = optionsData.current_price || 87434.55;
        setCurrentPrice(currentBtcPrice);
        
        setPredictions([
          {
            method: "On-Chain Fundamental",
            current_price: currentBtcPrice,
            prediction_1d: 87405.96,
            prediction_7d: 87291.59,
            prediction_30d: 86862.71,
            signal: "Strong Buy",
            confidence: "High",
            details: {
              mvrv: 1.55,
              nvt_signal: 337.87,
              valuation_score: 25.1,
              status: "Undervalued",
              note: "Uses blockchain metrics (MVRV ratio) to determine intrinsic value"
            }
          },
          {
            method: "LSTM Machine Learning",
            current_price: currentBtcPrice,
            prediction_1d: 85725.93,
            prediction_7d: 78642.61,
            prediction_30d: 94155.75,
            signal: "Model-Based",
            confidence: "Medium",
            details: {
              directional_accuracy: "55.99%",
              mape: "1.42%",
              note: "Improved model using log returns, RSI, and volatility indicators"
            }
          },
          {
            method: "Options-Implied",
            current_price: currentBtcPrice,
            prediction_1d: optionsData.predictions?.['1_day']?.expected_price || currentBtcPrice,
            prediction_7d: optionsData.predictions?.['7_day']?.expected_price || currentBtcPrice,
            prediction_30d: optionsData.predictions?.['30_day']?.expected_price || currentBtcPrice,
            signal: "Market-Based",
            confidence: "High",
            details: {
              source: "Deribit Options Market",
              note: "Real-time data from Bitcoin options trading. Only available from 2016 onwards.",
              total_oi: optionsData.predictions?.['30_day']?.total_open_interest
            }
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up auto-refresh every 3 hours
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing predictions...');
      loadData();
    }, 3 * 60 * 60 * 1000); // 3 hours in milliseconds
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getPriceChange = (current: number, predicted: number) => {
    const change = ((predicted - current) / current) * 100;
    return change;
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes("Buy")) return "text-green-500";
    if (signal.includes("Sell")) return "text-red-500";
    return "text-muted-foreground";
  };

  const getSignalBadgeVariant = (signal: string): "default" | "secondary" | "destructive" | "outline" => {
    if (signal.includes("Strong Buy")) return "default";
    if (signal.includes("Buy")) return "secondary";
    if (signal.includes("Sell")) return "destructive";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bitcoin className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bitcoin Price Prediction</h1>
                <p className="text-sm text-muted-foreground">Comparing Three Advanced Methodologies</p>
                <p className="text-xs text-muted-foreground mt-1">Group 4 • MH6805 Assignment</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Prediction Table - Main Focus */}
        {!loading && (
          <div className="mb-8">
            <PredictionTable 
              predictions={predictions}
              currentPrice={currentPrice}
              lastUpdate={new Date().toLocaleString('en-US', { 
                month: 'numeric',
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })}
            />
          </div>
        )}

        {/* Current Price Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Bitcoin Price</p>
                <h2 className="text-4xl font-bold text-foreground">{formatPrice(currentPrice)}</h2>
                <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleString()}</p>
              </div>
              <Activity className="h-16 w-16 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Methodology Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="onchain">On-Chain</TabsTrigger>
            <TabsTrigger value="lstm">LSTM ML</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Historical Price Chart */}
            <PriceChart />
            
            {/* Prediction Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {predictions.map((pred, idx) => (
                <Card key={idx} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pred.method}</CardTitle>
                      {idx === 0 && <BarChart3 className="h-5 w-5 text-primary" />}
                      {idx === 1 && <Brain className="h-5 w-5 text-primary" />}
                      {idx === 2 && <LineChart className="h-5 w-5 text-primary" />}
                    </div>
                    <CardDescription>
                      <Badge variant={getSignalBadgeVariant(pred.signal)} className="mt-2">
                        {pred.signal}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 1 Day Prediction */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">1-Day</span>
                        <div className="flex items-center gap-1">
                          {getPriceChange(pred.current_price, pred.prediction_1d) > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={getPriceChange(pred.current_price, pred.prediction_1d) > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                            {getPriceChange(pred.current_price, pred.prediction_1d).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold">{formatPrice(pred.prediction_1d)}</p>
                    </div>

                    {/* 7 Day Prediction */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">7-Day</span>
                        <div className="flex items-center gap-1">
                          {getPriceChange(pred.current_price, pred.prediction_7d) > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={getPriceChange(pred.current_price, pred.prediction_7d) > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                            {getPriceChange(pred.current_price, pred.prediction_7d).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold">{formatPrice(pred.prediction_7d)}</p>
                    </div>

                    {/* 30 Day Prediction */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">30-Day</span>
                        <div className="flex items-center gap-1">
                          {getPriceChange(pred.current_price, pred.prediction_30d) > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={getPriceChange(pred.current_price, pred.prediction_30d) > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                            {getPriceChange(pred.current_price, pred.prediction_30d).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold">{formatPrice(pred.prediction_30d)}</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{pred.confidence}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Methodology Comparison */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Methodology Comparison</CardTitle>
                <CardDescription>Strengths and ideal use cases for each prediction method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Criterion</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">On-Chain</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">LSTM</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Options</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">Best Time Horizon</td>
                        <td className="py-3 px-4">3-12 months</td>
                        <td className="py-3 px-4">1-30 days</td>
                        <td className="py-3 px-4">30-90 days</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">Data Source</td>
                        <td className="py-3 px-4">Blockchain metrics</td>
                        <td className="py-3 px-4">Historical prices</td>
                        <td className="py-3 px-4">Options markets</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">ATH Prediction</td>
                        <td className="py-3 px-4">
                          <Badge variant="default" className="bg-green-500">Excellent</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">Mixed</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">Not Testable</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">Best Use Case</td>
                        <td className="py-3 px-4">Cycle timing, valuation</td>
                        <td className="py-3 px-4">Short-term trading</td>
                        <td className="py-3 px-4">Market sentiment</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Update Frequency</td>
                        <td className="py-3 px-4">Daily</td>
                        <td className="py-3 px-4">Continuous</td>
                        <td className="py-3 px-4">Real-time</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Historical Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Historical ATH Prediction Performance</CardTitle>
                <CardDescription>How each method performed before major all-time highs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">On-Chain</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">LSTM</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">2013 ATH</td>
                        <td className="py-3 px-4">$1,134.93</td>
                        <td className="py-3 px-4">
                          <Badge variant="destructive">Strong Sell</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">Mixed</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">N/A</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 font-medium">2017 ATH</td>
                        <td className="py-3 px-4">$19,640.51</td>
                        <td className="py-3 px-4">
                          <Badge variant="destructive">Strong Sell</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">Mixed</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">N/A</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">2021 ATH</td>
                        <td className="py-3 px-4">$67,541.76</td>
                        <td className="py-3 px-4">
                          <Badge variant="destructive">Sell</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">Strong Buy</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">N/A</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* On-Chain Tab */}
          <TabsContent value="onchain" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  On-Chain Fundamental Analysis
                </CardTitle>
                <CardDescription>
                  Uses blockchain metrics like MVRV and NVT ratios to assess Bitcoin's intrinsic value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Key Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">MVRV Ratio</span>
                        <span className="font-semibold">1.55</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">NVT Signal</span>
                        <span className="font-semibold">337.87</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Valuation Score</span>
                        <span className="font-semibold">25.1/100</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Status</span>
                        <Badge variant="default">Undervalued</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Interpretation</h4>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                      <p>Bitcoin is moderately valued with MVRV between 1-2, suggesting fair value with room for growth.</p>
                      <p className="text-muted-foreground">
                        Historical data shows MVRV &lt; 1 marks bottoms, while MVRV &gt; 3.5 indicates tops.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Historical Performance</h4>
                  <p className="text-sm">
                    ✅ Successfully predicted all three major ATHs (2013, 2017, 2021) with "Sell" or "Strong Sell" signals 30-90 days before peaks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LSTM Tab */}
          <TabsContent value="lstm" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  LSTM Machine Learning Model
                </CardTitle>
                <CardDescription>
                  Deep learning neural network trained on historical price patterns and technical indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Model Performance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Directional Accuracy</span>
                        <span className="font-semibold">55.99%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Training Period</span>
                        <span className="font-semibold">2010-2025</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Features Used</span>
                        <span className="font-semibold">15+</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Features</h4>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-1 text-sm">
                      <p>• Moving Averages (7, 25, 99 day)</p>
                      <p>• Technical Indicators (RSI, MACD)</p>
                      <p>• Bollinger Bands</p>
                      <p>• Momentum & Volatility Metrics</p>
                      <p>• Price Action Patterns</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Strengths & Limitations</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Strengths</p>
                      <p className="text-xs text-muted-foreground">Best for short-term (1-7 day) predictions in stable markets</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Limitations</p>
                      <p className="text-xs text-muted-foreground">Struggles with unprecedented market conditions and regime changes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Options-Implied Probability
                </CardTitle>
                <CardDescription>
                  Extracts market expectations from Bitcoin options prices using Breeden-Litzenberger formula
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 3D Probability Surface */}
                <Options3DSurface />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Methodology</h4>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <p>• Fetches options chain from Deribit (85% of BTC options market)</p>
                    <p>• Applies Breeden-Litzenberger formula to extract probability distribution</p>
                    <p>• Calculates expected price and confidence intervals</p>
                    <p>• Best for 30-90 day predictions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Key Advantages</h4>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <p>✓ Reflects real institutional trader expectations</p>
                    <p>✓ Forward-looking (not based on past patterns)</p>
                    <p>✓ Provides probability distributions, not just point estimates</p>
                    <p>✓ Updates in real-time as market conditions change</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Methodology Comparison */}
        <Card className="mt-8 bg-card border-border">
          <CardHeader>
            <CardTitle>Methodology Comparison</CardTitle>
            <CardDescription>Strengths and ideal use cases for each prediction method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Criterion</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">On-Chain</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">LSTM</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Options</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Best Time Horizon</td>
                    <td className="py-3 px-4">3-12 months</td>
                    <td className="py-3 px-4">1-30 days</td>
                    <td className="py-3 px-4">30-90 days</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Data Source</td>
                    <td className="py-3 px-4">Blockchain metrics</td>
                    <td className="py-3 px-4">Historical prices</td>
                    <td className="py-3 px-4">Options markets</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">ATH Prediction</td>
                    <td className="py-3 px-4">
                      <Badge variant="default" className="bg-green-500">Excellent</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">Mixed</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">Not Testable</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 font-medium">Best Use Case</td>
                    <td className="py-3 px-4">Cycle timing, valuation</td>
                    <td className="py-3 px-4">Short-term trading</td>
                    <td className="py-3 px-4">Market sentiment</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Update Frequency</td>
                    <td className="py-3 px-4">Daily</td>
                    <td className="py-3 px-4">Continuous</td>
                    <td className="py-3 px-4">Real-time</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Model Explanations */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard 
            title="Why LSTM Shows Volatility"
            description="The LSTM model uses log returns and technical indicators (RSI, volatility) for predictions. While improved from the original (1.42% error vs 50%+), it still shows higher variance than on-chain metrics because it relies on price patterns rather than fundamental value. Best used for short-term trend detection."
            type="info"
          />
          <InfoCard 
            title="Options Data Limitation"
            description="Bitcoin options markets only began in 2016 (Deribit) and 2017 (CME), so we cannot backtest this method against 2013 and 2017 ATHs. However, for current predictions, options data provides real-time market sentiment from institutional traders."
            type="warning"
          />
          <InfoCard 
            title="On-Chain Reliability"
            description="On-chain analysis successfully predicted all three major ATHs (2013, 2017, 2021) with 'Sell' signals 30-90 days before peaks. The MVRV ratio above 3.5 has historically indicated extreme overvaluation, making it the most reliable method for cycle timing."
            type="info"
          />
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-destructive/10 border-destructive/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This tool is for educational and informational purposes only. It does not constitute financial advice. 
              Cryptocurrency investments are highly volatile and risky. Past performance does not guarantee future results. 
              Always conduct your own research and consult with financial professionals before making investment decisions.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Bitcoin Price Prediction Comparison • Powered by On-Chain Analysis, Machine Learning & Options Data
            </p>
            <p className="text-xs text-muted-foreground">
              Group 4 Project • MH6805 Course Assignment
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
