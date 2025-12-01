#!/usr/bin/env python3
"""
Fetch latest Bitcoin price data
"""
import json
import requests
from datetime import datetime

def fetch_latest_price():
    """Fetch current Bitcoin price from CoinGecko API"""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            'ids': 'bitcoin',
            'vs_currencies': 'usd',
            'include_24hr_change': 'true',
            'include_last_updated_at': 'true'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        price = data['bitcoin']['usd']
        change_24h = data['bitcoin'].get('usd_24h_change', 0)
        timestamp = data['bitcoin'].get('last_updated_at', int(datetime.now().timestamp()))
        
        result = {
            'price': price,
            'change_24h': change_24h,
            'timestamp': timestamp,
            'date': datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Save to results - use relative path for GitHub Actions
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.dirname(script_dir)
        output_dir = os.path.join(repo_root, 'client', 'public')
        os.makedirs(output_dir, exist_ok=True)
        
        output_file = os.path.join(output_dir, 'current_price.json')
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"✓ Fetched current BTC price: ${price:,.2f}")
        print(f"  24h change: {change_24h:+.2f}%")
        
        return result
        
    except Exception as e:
        print(f"Error fetching price: {e}")
        return None

if __name__ == "__main__":
    fetch_latest_price()
