#!/usr/bin/env python3
"""
Generate 3D probability surface data using Deribit ticker data
"""

import requests
import json
import numpy as np
from datetime import datetime
import time

def fetch_options_with_prices():
    """Fetch Bitcoin options with current prices from Deribit"""
    base_url = "https://www.deribit.com/api/v2/public"
    
    # Get current BTC price
    ticker_url = f"{base_url}/get_index_price?index_name=btc_usd"
    ticker_response = requests.get(ticker_url)
    current_price = ticker_response.json()['result']['index_price']
    
    print(f"Current BTC Price: ${current_price:,.2f}")
    
    # Get book summary for all BTC options
    summary_url = f"{base_url}/get_book_summary_by_currency?currency=BTC&kind=option"
    summary_response = requests.get(summary_url)
    tickers = summary_response.json()['result']
    
    print(f"Found {len(tickers)} options with ticker data")
    
    return current_price, tickers

def parse_option_name(instrument_name):
    """Parse Deribit option name: BTC-25MAR23-30000-C"""
    parts = instrument_name.split('-')
    if len(parts) != 4:
        return None
    
    date_str = parts[1]
    strike = float(parts[2])
    option_type = parts[3]  # C or P
    
    # Parse expiration date
    try:
        exp_date = datetime.strptime(date_str, '%d%b%y')
    except:
        return None
    
    return {
        'expiration': exp_date,
        'strike': strike,
        'type': option_type
    }

def calculate_probability_density(strikes, call_prices, current_price):
    """Calculate probability density using numerical differentiation"""
    # Sort by strike
    sorted_indices = np.argsort(strikes)
    strikes = np.array(strikes)[sorted_indices]
    call_prices = np.array(call_prices)[sorted_indices]
    
    # Remove zeros and very small prices
    mask = call_prices > 0.0001
    strikes = strikes[mask]
    call_prices = call_prices[mask]
    
    if len(strikes) < 5:
        return None, None
    
    # Create fine grid
    strike_range = strikes.max() - strikes.min()
    if strike_range < current_price * 0.1:  # Too narrow range
        return None, None
    
    fine_strikes = np.linspace(strikes.min(), strikes.max(), 60)
    
    # Interpolate prices
    fine_prices = np.interp(fine_strikes, strikes, call_prices)
    
    # Calculate second derivative
    h = fine_strikes[1] - fine_strikes[0]
    second_deriv = np.zeros(len(fine_strikes))
    
    for i in range(1, len(fine_strikes) - 1):
        second_deriv[i] = (fine_prices[i+1] - 2*fine_prices[i] + fine_prices[i-1]) / (h**2)
    
    # Smooth with moving average
    window = 5
    if len(second_deriv) >= window:
        smoothed = np.convolve(second_deriv, np.ones(window)/window, mode='same')
    else:
        smoothed = second_deriv
    
    # Ensure non-negative and normalize
    probability = np.maximum(smoothed, 0)
    if probability.sum() > 0:
        probability = probability / probability.sum()
        # Scale for better visualization (percentage)
        probability = probability * 100
    
    return fine_strikes, probability

def generate_3d_surface_data(current_price, tickers):
    """Generate 3D surface data for visualization"""
    
    # Group options by expiration date
    options_by_expiry = {}
    
    for ticker in tickers:
        inst_name = ticker['instrument_name']
        parsed = parse_option_name(inst_name)
        
        if not parsed or parsed['type'] != 'C':  # Only use calls
            continue
        
        exp_date = parsed['expiration']
        days_to_expiry = (exp_date - datetime.now()).days
        
        # Only use options expiring in next 90 days
        if days_to_expiry < 1 or days_to_expiry > 90:
            continue
        
        # Use mark_price from ticker
        mark_price = ticker.get('mark_price')
        if not mark_price or mark_price <= 0:
            continue
        
        if exp_date not in options_by_expiry:
            options_by_expiry[exp_date] = []
        
        options_by_expiry[exp_date].append({
            'strike': parsed['strike'],
            'mark_price': mark_price * current_price  # Convert to USD
        })
    
    print(f"Processing {len(options_by_expiry)} expiration dates")
    
    # Generate probability surface
    surface_data = []
    
    for exp_date in sorted(options_by_expiry.keys())[:20]:  # Limit to 20 dates
        options = options_by_expiry[exp_date]
        
        days_to_expiry = (exp_date - datetime.now()).days
        print(f"  {exp_date.strftime('%Y-%m-%d')} ({days_to_expiry}d): {len(options)} options")
        
        if len(options) < 8:  # Need enough data points
            print(f"    Skipped: too few options")
            continue
        
        strikes = [opt['strike'] for opt in options]
        prices = [opt['mark_price'] for opt in options]
        
        prob_strikes, probabilities = calculate_probability_density(strikes, prices, current_price)
        
        if prob_strikes is None:
            print(f"    Skipped: probability calculation failed")
            continue
        
        surface_data.append({
            'date': exp_date.strftime('%Y-%m-%d'),
            'days_to_expiry': days_to_expiry,
            'strikes': prob_strikes.tolist(),
            'probabilities': probabilities.tolist()
        })
        
        print(f"    ✓ Generated {len(prob_strikes)} price points")
    
    return surface_data

def main():
    print("Fetching Deribit options ticker data...")
    current_price, tickers = fetch_options_with_prices()
    
    print("\nGenerating 3D probability surface...")
    surface_data = generate_3d_surface_data(current_price, tickers)
    
    # Save to JSON
    output = {
        'current_price': current_price,
        'generated_at': datetime.now().isoformat(),
        'surface_data': surface_data
    }
    
    output_path = '/home/ubuntu/btc_prediction/results/options_3d_surface.json'
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✓ 3D surface data saved to {output_path}")
    print(f"  Generated {len(surface_data)} time slices")
    print(f"  Current BTC price: ${current_price:,.2f}")

if __name__ == '__main__':
    main()
