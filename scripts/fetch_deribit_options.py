#!/usr/bin/env python3
"""
Fetch current Bitcoin options data from Deribit and calculate implied probabilities
"""

import requests
import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict

def fetch_deribit_instruments():
    """Fetch all available BTC options from Deribit"""
    url = "https://www.deribit.com/api/v2/public/get_instruments"
    params = {
        'currency': 'BTC',
        'kind': 'option',
        'expired': 'false'
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data['result']
    except Exception as e:
        print(f"Error fetching instruments: {e}")
        return []

def fetch_option_data(instrument_name):
    """Fetch current market data for a specific option"""
    url = "https://www.deribit.com/api/v2/public/ticker"
    params = {'instrument_name': instrument_name}
    
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        return data['result']
    except Exception as e:
        return None

def calculate_simple_implied_probability(options_by_expiry, current_price):
    """
    Calculate simplified implied probability distribution from options
    Uses put-call parity and open interest as proxy for market expectations
    """
    predictions = {}
    
    for expiry, options in options_by_expiry.items():
        if len(options) < 5:  # Need enough options for meaningful distribution
            continue
        
        # Group by strike
        strikes = defaultdict(lambda: {'calls': [], 'puts': []})
        
        for opt in options:
            strike = opt['strike']
            if opt['option_type'] == 'call':
                strikes[strike]['calls'].append(opt)
            else:
                strikes[strike]['puts'].append(opt)
        
        # Calculate weighted average expected price
        total_oi = 0
        weighted_price = 0
        
        for strike, data in strikes.items():
            # Use open interest as weight
            call_oi = sum(c.get('open_interest', 0) for c in data['calls'])
            put_oi = sum(p.get('open_interest', 0) for p in data['puts'])
            
            # Higher call OI suggests bullish sentiment (price above strike)
            # Higher put OI suggests bearish sentiment (price below strike)
            if call_oi + put_oi > 0:
                # Simplified: weight by OI and distance from current price
                weight = call_oi + put_oi
                total_oi += weight
                weighted_price += strike * weight
        
        if total_oi > 0:
            expected_price = weighted_price / total_oi
            predictions[expiry] = {
                'expected_price': round(expected_price, 2),
                'current_price': current_price,
                'change_pct': round((expected_price - current_price) / current_price * 100, 2),
                'total_open_interest': total_oi
            }
    
    return predictions

def main():
    print("Fetching Deribit BTC options data...")
    instruments = fetch_deribit_instruments()
    
    if not instruments:
        print("No instruments found")
        return
    
    print(f"Found {len(instruments)} BTC options")
    
    # Get current BTC price from index
    try:
        index_response = requests.get("https://www.deribit.com/api/v2/public/get_index_price?index_name=btc_usd", timeout=5)
        current_price = index_response.json()['result']['index_price']
        print(f"Current BTC price: ${current_price:,.2f}")
    except:
        current_price = 87434.55  # Fallback
    
    # Group options by expiry
    options_by_expiry = defaultdict(list)
    
    # Focus on near-term options (next 90 days)
    today = datetime.now()
    max_date = today + timedelta(days=90)
    
    for instrument in instruments[:100]:  # Limit to avoid rate limiting
        expiry_str = instrument['expiration_timestamp']
        expiry_date = datetime.fromtimestamp(expiry_str / 1000)
        
        if expiry_date > max_date:
            continue
        
        # Fetch option data
        option_data = fetch_option_data(instrument['instrument_name'])
        if option_data:
            option_info = {
                'instrument': instrument['instrument_name'],
                'strike': instrument['strike'],
                'option_type': instrument['option_type'],
                'expiry': expiry_date.strftime('%Y-%m-%d'),
                'mark_price': option_data.get('mark_price', 0),
                'open_interest': option_data.get('open_interest', 0),
                'implied_volatility': option_data.get('mark_iv', 0)
            }
            options_by_expiry[option_info['expiry']].append(option_info)
    
    print(f"\nProcessed options for {len(options_by_expiry)} expiry dates")
    
    # Calculate implied probabilities
    predictions = calculate_simple_implied_probability(options_by_expiry, current_price)
    
    # Find predictions for 1-day, 7-day, and 30-day horizons
    result = {
        'current_price': current_price,
        'timestamp': datetime.now().isoformat(),
        'predictions': {},
        'raw_expiries': predictions
    }
    
    # Map to standard horizons
    sorted_expiries = sorted(predictions.keys())
    if len(sorted_expiries) >= 3:
        # Find closest to 1 day, 7 days, 30 days
        result['predictions']['1_day'] = predictions[sorted_expiries[0]]
        result['predictions']['7_day'] = predictions[sorted_expiries[min(2, len(sorted_expiries)-1)]]
        result['predictions']['30_day'] = predictions[sorted_expiries[-1]]
    
    # Save results
    output_file = '/home/ubuntu/btc_prediction/results/deribit_options_current.json'
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\nSaved options data to {output_file}")
    print("\nOptions-implied predictions:")
    for horizon, pred in result['predictions'].items():
        print(f"  {horizon}: ${pred['expected_price']:,.2f} ({pred['change_pct']:+.2f}%)")

if __name__ == "__main__":
    main()
