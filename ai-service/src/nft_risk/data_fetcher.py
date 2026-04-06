"""
ChainGuard AI — NFT Data Fetcher
Fetches contract data from Etherscan + OpenSea to build feature vectors.
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

ETHERSCAN_BASE = "https://api.etherscan.io/api"
OPENSEA_BASE   = "https://api.opensea.io/api/v2"


async def fetch_etherscan(contract_address: str) -> Dict[str, Any]:
    """Fetch contract data from Etherscan."""
    api_key = os.getenv("ETHERSCAN_API_KEY", "")
    result  = {}

    if not api_key or api_key == "your_etherscan_api_key":
        return result

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Contract creation info
            resp = await client.get(ETHERSCAN_BASE, params={
                "module":  "contract",
                "action":  "getcontractcreation",
                "contractaddresses": contract_address,
                "apikey":  api_key,
            })
            data = resp.json()

            if data.get("status") == "1" and data.get("result"):
                creation = data["result"][0]
                # Get contract age from transaction timestamp
                tx_resp = await client.get(ETHERSCAN_BASE, params={
                    "module": "proxy",
                    "action": "eth_getTransactionByHash",
                    "txhash": creation.get("txHash", ""),
                    "apikey": api_key,
                })
                # Approximate age based on block number
                block_hex = tx_resp.json().get("result", {}).get("blockNumber", "0x0")
                block_num = int(block_hex, 16) if block_hex != "0x0" else 0
                # ~15s per block, estimate age
                current_block = 19_000_000  # approximate
                age_seconds   = (current_block - block_num) * 15
                result["contract_age_days"] = age_seconds / 86400

    except Exception as e:
        logger.warning(f"Etherscan fetch failed: {e}")

    return result


async def fetch_opensea(collection_slug: str) -> Dict[str, Any]:
    """Fetch collection data from OpenSea."""
    api_key = os.getenv("OPENSEA_API_KEY", "")
    headers = {"Accept": "application/json"}
    if api_key and api_key != "your_opensea_api_key":
        headers["x-api-key"] = api_key

    result = {}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{OPENSEA_BASE}/collections/{collection_slug}",
                headers=headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("stats", {})
                result = {
                    "total_volume_eth":     float(stats.get("total_volume",     0)),
                    "seven_day_volume_eth": float(stats.get("seven_day_volume", 0)),
                    "floor_price_eth":      float(stats.get("floor_price",      0)),
                    "num_owners":           int(stats.get("num_owners",         0)),
                    "total_supply":         int(stats.get("total_supply",       1)),
                    "owner_ratio":          int(stats.get("num_owners", 0)) / max(int(stats.get("total_supply", 1)), 1),
                    "is_verified":          1 if data.get("safelist_request_status") == "verified" else 0,
                    "has_metadata":         1 if data.get("image_url") else 0,
                    "has_website":          1 if data.get("external_url") else 0,
                    "royalty_pct":          float(data.get("dev_seller_fee_basis_points", 500)) / 100,
                }
    except Exception as e:
        logger.warning(f"OpenSea fetch failed: {e}")

    return result


async def build_feature_vector(
    contract_address: Optional[str] = None,
    collection_slug:  Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a feature vector for risk assessment by fetching from APIs.
    Falls back to conservative defaults if APIs unavailable.
    """
    features = {
        # Conservative defaults (slightly risky)
        "contract_age_days":    30,
        "owner_ratio":          0.15,
        "total_volume_eth":     5,
        "seven_day_volume_eth": 0.5,
        "floor_price_eth":      0.05,
        "total_supply":         1000,
        "num_owners":           150,
        "royalty_pct":          5,
        "is_verified":          0,
        "has_metadata":         1,
        "has_website":          0,
        "price_volatility_7d":  0.3,
        "wash_trade_score":     0.15,
        "listing_ratio":        0.3,
    }

    # Fetch real data in parallel
    tasks = []
    if contract_address and len(contract_address) == 42:
        tasks.append(fetch_etherscan(contract_address))
    if collection_slug:
        tasks.append(fetch_opensea(collection_slug))

    if tasks:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, dict):
                features.update(r)

    return features
