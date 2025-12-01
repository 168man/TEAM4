import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, RefreshCw } from "lucide-react";

interface PredictionData {
  method: string;
  current_price: number;
  prediction_1d: number;
  prediction_7d: number;
  prediction_30d: number;
  signal: string;
  confidence: string;
}

interface PredictionTableProps {
  predictions: PredictionData[];
  currentPrice: number;
  lastUpdate: string;
}

export default function PredictionTable({ predictions, currentPrice, lastUpdate }: PredictionTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getPriceChange = (current: number, predicted: number) => {
    return ((predicted - current) / current) * 100;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getMethodIcon = (method: string) => {
    if (method.includes("On-Chain")) return "📊";
    if (method.includes("LSTM")) return "🤖";
    if (method.includes("Options")) return "📈";
    return "📉";
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Price Predictions Comparison</CardTitle>
            <CardDescription className="text-base">
              Real-time forecasts from three independent models
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <RefreshCw className="h-4 w-4" />
              <span>Updates every 3 hours</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-6 text-lg font-semibold">Model</th>
                <th className="text-center py-4 px-6 text-lg font-semibold">
                  <div className="flex flex-col items-center">
                    <span>Tomorrow</span>
                    <span className="text-xs font-normal text-muted-foreground">(1 Day)</span>
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-lg font-semibold">
                  <div className="flex flex-col items-center">
                    <span>Next Week</span>
                    <span className="text-xs font-normal text-muted-foreground">(7 Days)</span>
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-lg font-semibold">
                  <div className="flex flex-col items-center">
                    <span>Next Month</span>
                    <span className="text-xs font-normal text-muted-foreground">(30 Days)</span>
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-lg font-semibold">Signal</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, index) => {
                const change1d = getPriceChange(currentPrice, pred.prediction_1d);
                const change7d = getPriceChange(currentPrice, pred.prediction_7d);
                const change30d = getPriceChange(currentPrice, pred.prediction_30d);

                return (
                  <tr 
                    key={index} 
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMethodIcon(pred.method)}</span>
                        <div>
                          <div className="font-semibold text-lg">{pred.method}</div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {pred.confidence}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Tomorrow Prediction */}
                    <td className="py-6 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl font-bold">
                          {formatPrice(pred.prediction_1d)}
                        </div>
                        <div className={`flex items-center gap-1 text-base font-semibold ${getChangeColor(change1d)}`}>
                          {change1d > 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                          <span>{change1d > 0 ? '+' : ''}{change1d.toFixed(2)}%</span>
                        </div>
                      </div>
                    </td>

                    {/* Next Week Prediction */}
                    <td className="py-6 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl font-bold">
                          {formatPrice(pred.prediction_7d)}
                        </div>
                        <div className={`flex items-center gap-1 text-base font-semibold ${getChangeColor(change7d)}`}>
                          {change7d > 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                          <span>{change7d > 0 ? '+' : ''}{change7d.toFixed(2)}%</span>
                        </div>
                      </div>
                    </td>

                    {/* Next Month Prediction */}
                    <td className="py-6 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl font-bold">
                          {formatPrice(pred.prediction_30d)}
                        </div>
                        <div className={`flex items-center gap-1 text-base font-semibold ${getChangeColor(change30d)}`}>
                          {change30d > 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                          <span>{change30d > 0 ? '+' : ''}{change30d.toFixed(2)}%</span>
                        </div>
                      </div>
                    </td>

                    {/* Signal */}
                    <td className="py-6 px-6 text-center">
                      <Badge 
                        variant={
                          pred.signal.includes("Buy") ? "default" : 
                          pred.signal.includes("Sell") ? "destructive" : 
                          "secondary"
                        }
                        className="text-base px-4 py-2"
                      >
                        {pred.signal}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Current Price Reference */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">Current BTC Price:</span>
            <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
