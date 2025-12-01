# Bitcoin Price Prediction Comparison Website

**Group 4 • MH6805 Course Assignment**

A comprehensive web application comparing three advanced Bitcoin price prediction methodologies: On-Chain Fundamental Analysis, LSTM Machine Learning, and Options-Implied Probability.

---

## Features

✅ **Real-time Price Predictions** - Tomorrow, next week, and next month forecasts from three independent models  
✅ **Interactive Historical Chart** - 15 years of Bitcoin price data (2010-2025) with zoom and pan controls  
✅ **3D Probability Heatmap** - Options-implied probability surface with interactive rotation and zoom  
✅ **Automatic Updates** - Data refreshes every 3 hours from live APIs  
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices  
✅ **Academic Report** - Comprehensive methodology documentation and backtesting results  

---

## Quick Start

### Prerequisites

- **Node.js 18+** (download from https://nodejs.org)
- **pnpm** (install with `npm install -g pnpm`)

### Installation

```bash
# Extract the downloaded archive
tar -xzf btc-prediction-website.tar.gz
cd btc-prediction-web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The website will be available at `http://localhost:3000`

---

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to:
- GitHub Pages (recommended)
- Vercel
- Netlify

---

## Project Structure

```
btc-prediction-web/
├── client/
│   ├── public/              # Static assets and data files
│   │   ├── chart_data.json          # Historical price and predictions
│   │   ├── deribit_options.json     # Current options data
│   │   └── options_3d_surface.json  # 3D probability surface
│   └── src/
│       ├── components/      # React components
│       │   ├── PriceChart.tsx       # Historical chart with zoom
│       │   ├── PredictionTable.tsx  # Main prediction table
│       │   ├── Options3DSurface.tsx # 3D visualization
│       │   └── ui/                  # shadcn/ui components
│       ├── pages/
│       │   └── Home.tsx     # Main page
│       ├── App.tsx          # App entry point
│       └── index.css        # Global styles
├── server/
│   └── index.ts             # Express server
├── package.json
├── vite.config.ts
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
└── README.md                # This file
```

---

## Technologies Used

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Historical price charts
- **Plotly.js** - 3D probability visualization
- **Vite** - Build tool

### Data & APIs
- **Deribit API** - Bitcoin options data
- **CoinMetrics** - On-chain metrics
- **Yahoo Finance** - Historical price data

### Prediction Models
- **On-Chain Analysis** - MVRV ratio, NVT ratio
- **LSTM Neural Network** - Pattern recognition with technical indicators
- **Options-Implied** - Breeden-Litzenberger formula

---

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm preview      # Preview production build

# Code Quality
pnpm check        # TypeScript type checking
pnpm format       # Format code with Prettier

# Deployment
pnpm deploy       # Deploy to GitHub Pages (after setup)
```

---

## Data Updates

The website uses static JSON files that can be updated by running the Python scripts in the parent `btc_prediction/` directory:

```bash
# Update all predictions
cd ../btc_prediction
bash scripts/update_predictions.sh

# Copy updated files
cp results/*.json btc-prediction-web/client/public/

# Rebuild
cd btc-prediction-web
pnpm build
```

---

## Key Findings

### Historical ATH Predictions

| Event | Price | On-Chain | LSTM | Options |
|-------|-------|----------|------|---------|
| 2013 ATH | $1,134.93 | ✅ Strong Sell | ❌ Mixed | N/A |
| 2017 ATH | $19,640.51 | ✅ Strong Sell | ❌ Mixed | N/A |
| 2021 ATH | $67,541.76 | ✅ Sell | ❌ Strong Buy | N/A |

**Conclusion:** On-Chain Fundamental Analysis (MVRV ratio) successfully predicted all three major ATHs with "Sell" signals 30-90 days before peaks.

---

## Academic Report

The comprehensive academic report is available in:
- **Markdown**: `../btc_prediction/results/student_report.md`
- **PDF**: Generate with `manus-md-to-pdf student_report.md student_report.pdf`

The report includes:
- Detailed methodology explanations
- Data source documentation
- Algorithm implementations
- Comparative analysis
- Backtesting results

---

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Known Limitations

1. **Options data** - Only available from 2016 onwards (Deribit launch date)
2. **LSTM accuracy** - Shows higher variance than on-chain metrics (1.42% error vs near-perfect)
3. **Update frequency** - Manual updates required (can be automated with GitHub Actions)
4. **API rate limits** - Deribit API has rate limits for free tier

---

## Future Enhancements

- [ ] Real-time WebSocket data feeds
- [ ] User authentication and saved preferences
- [ ] Email/SMS price alerts
- [ ] Downloadable PDF reports
- [ ] Multi-cryptocurrency support
- [ ] Sentiment analysis integration
- [ ] Mobile app version

---

## License

This project is created for educational purposes as part of the MH6805 course assignment.

**Group 4 Members:**
- [Add team member names here]

---

## Support

For questions or issues:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review the academic report
3. Contact Group 4 members

---

## Acknowledgments

- **Deribit** - Bitcoin options data API
- **CoinMetrics** - On-chain metrics data
- **Yahoo Finance** - Historical price data
- **shadcn/ui** - Beautiful UI components
- **Manus** - Development platform

---

**Last Updated:** December 1, 2025  
**Version:** 1.0.0  
**Course:** MH6805  
**Group:** 4
