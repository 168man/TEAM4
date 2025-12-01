import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

interface SurfaceDataPoint {
  date: string;
  days_to_expiry: number;
  strikes: number[];
  probabilities: number[];
}

interface SurfaceData {
  current_price: number;
  generated_at: string;
  surface_data: SurfaceDataPoint[];
}

export default function Options3DSurface() {
  const [surfaceData, setSurfaceData] = useState<SurfaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/options_3d_surface.json')
      .then(res => res.json())
      .then(data => {
        setSurfaceData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load 3D surface data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card rounded-lg border border-border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D probability surface...</p>
        </div>
      </div>
    );
  }

  if (!surfaceData || surfaceData.surface_data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">No 3D surface data available</p>
      </div>
    );
  }

  // Prepare data for 3D surface plot
  const { surface_data, current_price } = surfaceData;

  // Create meshgrid for surface
  const x = surface_data.map(d => d.days_to_expiry); // Time axis (days to expiry)
  const y = surface_data[0].strikes; // Price axis (strike prices)
  
  // Create Z matrix (probabilities)
  const z = surface_data.map(slice => slice.probabilities);

  // Create surface trace
  const surfaceTrace: any = {
    type: 'surface' as const,
    x: x,
    y: y,
    z: z,
    colorscale: [
      [0, '#1a1a2e'],      // Dark blue (low probability)
      [0.2, '#16213e'],    // Dark navy
      [0.4, '#0f4c75'],    // Medium blue
      [0.6, '#3282b8'],    // Light blue
      [0.8, '#f7931a'],    // Bitcoin orange (medium-high)
      [1, '#ff6b35']       // Bright orange (high probability)
    ] as any,
    colorbar: {
      title: { text: 'Probability (%)' },
      titleside: 'right',
      tickfont: { color: '#888' },
      titlefont: { color: '#fff' }
    } as any,
    contours: {
      z: {
        show: true,
        usecolormap: true,
        highlightcolor: '#fff',
        project: { z: true }
      }
    },
    lighting: {
      ambient: 0.8,
      diffuse: 0.8,
      specular: 0.2,
      roughness: 0.5,
      fresnel: 0.2
    }
  };

  // Add current price line
  const currentPriceLine = {
    type: 'scatter3d' as const,
    mode: 'lines' as const,
    x: x,
    y: Array(x.length).fill(current_price),
    z: Array(x.length).fill(Math.max(...z.flat()) * 0.5),
    line: {
      color: '#f7931a',
      width: 6
    },
    name: `Current Price: $${current_price.toLocaleString()}`,
    showlegend: true
  };

  const layout = {
    autosize: true,
    height: 600,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#fff',
      family: 'Inter, sans-serif'
    },
    scene: {
      xaxis: {
        title: { text: 'Days to Expiration' },
        gridcolor: '#333',
        zerolinecolor: '#555',
        titlefont: { color: '#fff' },
        tickfont: { color: '#888' }
      },
      yaxis: {
        title: { text: 'Bitcoin Price (USD)' },
        gridcolor: '#333',
        zerolinecolor: '#555',
        titlefont: { color: '#fff' },
        tickfont: { color: '#888' }
      },
      zaxis: {
        title: { text: 'Probability Density (%)' },
        gridcolor: '#333',
        zerolinecolor: '#555',
        titlefont: { color: '#fff' },
        tickfont: { color: '#888' }
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.3 },
        center: { x: 0, y: 0, z: -0.1 },
        projection: { type: 'perspective' }
      },
      bgcolor: '#0a0a0a',
      dragmode: 'turntable' as const
    },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 40
    },
    title: {
      text: 'Options-Implied Probability Distribution',
      font: { size: 18, color: '#fff' },
      x: 0.5,
      xanchor: 'center' as const
    },
    legend: {
      x: 0.7,
      y: 0.9,
      bgcolor: 'rgba(0,0,0,0.5)',
      bordercolor: '#555',
      borderwidth: 1,
      font: { color: '#fff' }
    }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    scrollZoom: true,
    doubleClick: 'reset' as const,
    modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'] as any,
    toImageButtonOptions: {
      format: 'png' as const,
      filename: 'btc_options_3d_surface',
      height: 1080,
      width: 1920,
      scale: 2
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">3D Probability Heatmap</h3>
        <p className="text-sm text-muted-foreground">
          This surface shows the probability distribution of Bitcoin prices across different expiration dates, 
          extracted from options prices using the Breeden-Litzenberger formula. 
          Warmer colors (orange) indicate higher probability regions where the market expects Bitcoin to be.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <strong>How to read:</strong> The peak of the surface at any given time horizon shows the most likely price. 
          The width shows uncertainty - wider peaks mean more price uncertainty.
        </p>
      </div>
      
      <Plot
        data={[surfaceTrace, currentPriceLine]}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '600px' }}
        useResizeHandler={true}
      />
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/20 p-3 rounded">
          <div className="text-muted-foreground mb-1">Current BTC Price</div>
          <div className="text-2xl font-bold text-primary">
            ${current_price.toLocaleString()}
          </div>
        </div>
        <div className="bg-muted/20 p-3 rounded">
          <div className="text-muted-foreground mb-1">Data Coverage</div>
          <div className="text-2xl font-bold">
            {Math.min(...x)}-{Math.max(...x)} days
          </div>
        </div>
      </div>
    </div>
  );
}
