"""
ChainGuard AI — NFT Risk Router
XGBoost ML pipeline + Etherscan/OpenSea data fetching
"""

import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .model import get_nft_model
from .data_fetcher import build_feature_vector

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class NFTEvaluateRequest(BaseModel):
    contract_address: Optional[str] = None
    collection_slug:  Optional[str] = None
    token_id:         Optional[str] = None

class RiskFactor(BaseModel):
    name:        str
    description: str
    severity:    str   # safe | low | medium | high | critical
    score:       float

class NFTRiskResponse(BaseModel):
    report_id:        str
    contract_address: Optional[str]
    collection_slug:  Optional[str]
    risk_score:       float
    risk_band:        str
    risk_label:       str
    factors:          list[RiskFactor]
    model_used:       str
    evaluated_at:     str


# ── Helpers ───────────────────────────────────────────────────────────────────
def _score_to_severity(score: float) -> str:
    if score < 30: return "safe"
    if score < 60: return "medium"
    if score < 80: return "high"
    return "critical"

def _build_risk_factors(features: dict, prediction: dict) -> list[RiskFactor]:
    """Build human-readable risk factors from feature vector and prediction."""
    factors = []

    # ── Contract Safety ───────────────────────────────────────────────────────
    age  = features.get("contract_age_days", 30)
    verified = features.get("is_verified", 0)
    if verified:
        contract_score = 90
        contract_detail = "Contract is verified — no malicious patterns detected"
        contract_sev = "safe"
    elif age > 180:
        contract_score = 70
        contract_detail = f"Contract is {int(age)} days old but unverified — exercise caution"
        contract_sev = "medium"
    else:
        contract_score = 35
        contract_detail = f"Contract is only {int(age)} days old and unverified — high risk"
        contract_sev = "high"

    factors.append(RiskFactor(
        name="Contract Safety", score=contract_score,
        description=contract_detail, severity=contract_sev,
    ))

    # ── Metadata Integrity ────────────────────────────────────────────────────
    has_meta = features.get("has_metadata", 1)
    meta_score = 88 if has_meta else 30
    factors.append(RiskFactor(
        name="Metadata Integrity",
        score=meta_score,
        description="Metadata complete — images and attributes resolve correctly" if has_meta
                    else "Incomplete metadata — missing images or attributes",
        severity="safe" if has_meta else "high",
    ))

    # ── Trading Activity ──────────────────────────────────────────────────────
    owner_ratio  = features.get("owner_ratio",         0.1)
    wash_score   = features.get("wash_trade_score",    0.2)
    vol_7d       = features.get("seven_day_volume_eth", 0)
    num_owners   = features.get("num_owners",          100)

    if wash_score > 0.4:
        trade_score  = 25
        trade_detail = f"High wash trading signals detected ({wash_score:.0%} confidence)"
        trade_sev    = "high"
    elif owner_ratio > 0.35 and vol_7d > 5:
        trade_score  = 82
        trade_detail = f"Healthy trading — {num_owners:,} owners, {owner_ratio:.0%} owner ratio"
        trade_sev    = "safe"
    else:
        trade_score  = 48
        trade_detail = f"Moderate trading — {num_owners:,} owners, low 7-day volume"
        trade_sev    = "medium"

    factors.append(RiskFactor(
        name="Trading Activity", score=trade_score,
        description=trade_detail, severity=trade_sev,
    ))

    # ── Creator Reputation ────────────────────────────────────────────────────
    has_website = features.get("has_website", 0)
    rep_score   = 88 if (verified and has_website) else 60 if (verified or has_website) else 30
    factors.append(RiskFactor(
        name="Creator Reputation",
        score=rep_score,
        description="Verified creator with established web presence" if rep_score > 80
                    else "Limited creator verification — research before buying",
        severity=_score_to_severity(100 - rep_score),
    ))

    # ── Royalty Structure ─────────────────────────────────────────────────────
    royalty = features.get("royalty_pct", 5)
    if royalty == 0:
        roy_score, roy_detail, roy_sev = 25, "Zero royalty — potential rug pull indicator", "high"
    elif royalty <= 10:
        roy_score, roy_detail, roy_sev = 88, f"Standard {royalty:.1f}% royalty — creator committed", "safe"
    elif royalty <= 15:
        roy_score, roy_detail, roy_sev = 55, f"High {royalty:.1f}% royalty — above industry standard", "medium"
    else:
        roy_score, roy_detail, roy_sev = 25, f"Very high {royalty:.1f}% royalty — predatory structure", "high"

    factors.append(RiskFactor(
        name="Royalty Structure", score=roy_score,
        description=roy_detail, severity=roy_sev,
    ))

    # ── Liquidity Risk ────────────────────────────────────────────────────────
    floor  = features.get("floor_price_eth", 0)
    vol    = features.get("total_volume_eth", 0)
    liq_score = min(100, int(
        (min(floor, 10) / 10 * 40) +
        (min(vol, 1000) / 1000 * 40) +
        (min(owner_ratio, 1) * 20)
    ))
    factors.append(RiskFactor(
        name="Liquidity Risk",
        score=liq_score,
        description=f"Floor {floor:.3f} ETH · Vol {vol:.1f} ETH · {num_owners:,} holders" if floor > 0
                    else "Very low liquidity — may be difficult to sell",
        severity=_score_to_severity(100 - liq_score),
    ))

    return factors


# ── POST /nft/evaluate ────────────────────────────────────────────────────────
@router.post("/evaluate", response_model=NFTRiskResponse)
async def evaluate_nft(req: NFTEvaluateRequest):
    """
    Evaluate NFT risk using XGBoost ML model.
    Fetches real data from Etherscan + OpenSea when API keys are configured.
    Falls back to rule-based scoring gracefully.
    """
    if not req.contract_address and not req.collection_slug:
        raise HTTPException(
            status_code=400,
            detail="Provide either contract_address or collection_slug"
        )

    is_address = (
        req.contract_address and
        re.match(r'^0x[a-fA-F0-9]{40}$', req.contract_address)
    )

    logger.info(f"Evaluating NFT: {req.contract_address or req.collection_slug}")

    # ── Fetch features ────────────────────────────────────────────────────────
    features = await build_feature_vector(
        contract_address = req.contract_address if is_address else None,
        collection_slug  = req.collection_slug,
    )

    # ── ML prediction ─────────────────────────────────────────────────────────
    model      = get_nft_model()
    prediction = model.predict(features)

    # ── Build factors ─────────────────────────────────────────────────────────
    factors = _build_risk_factors(features, prediction)

    return NFTRiskResponse(
        report_id        = str(uuid.uuid4()),
        contract_address = req.contract_address,
        collection_slug  = req.collection_slug,
        risk_score       = float(prediction["risk_score"]),
        risk_band        = prediction["risk_band"],
        risk_label       = prediction["risk_label"],
        factors          = factors,
        model_used       = prediction["model_used"],
        evaluated_at     = datetime.now(timezone.utc).isoformat(),
    )


# ── GET /nft/model-info ───────────────────────────────────────────────────────
@router.get("/model-info")
async def model_info():
    """Get model metadata and feature importance."""
    model = get_nft_model()
    return {
        "is_trained":         model.is_trained,
        "model_type":         "XGBoostClassifier" if model.is_trained else "rule_based",
        "classes":            ["safe", "medium", "high", "critical"],
        "feature_count":      len(model.get_feature_importance()),
        "feature_importance": model.get_feature_importance(),
    }