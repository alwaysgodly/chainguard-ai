"""
ChainGuard AI — NFT Risk ML Model
XGBoost classifier trained on synthetic NFT risk data.
Features: contract age, owner ratio, volume, royalty, verification status, etc.
"""

import numpy as np
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# ── Feature definitions ───────────────────────────────────────────────────────
FEATURE_NAMES = [
    "contract_age_days",        # How old is the contract
    "owner_ratio",              # unique_owners / total_supply
    "total_volume_eth",         # All-time volume in ETH
    "seven_day_volume_eth",     # 7-day volume in ETH
    "floor_price_eth",          # Current floor price
    "total_supply",             # Total number of tokens
    "num_owners",               # Number of unique owners
    "royalty_pct",              # Royalty percentage (0-100)
    "is_verified",              # OpenSea verified (1/0)
    "has_metadata",             # Metadata complete (1/0)
    "has_website",              # Has project website (1/0)
    "price_volatility_7d",      # Price change variance last 7 days
    "wash_trade_score",         # Wash trading indicator (0-1)
    "listing_ratio",            # % of supply currently listed
]


def generate_training_data(n_samples: int = 2000):
    """
    Generate synthetic NFT training data with realistic distributions.
    Labels: 0=safe, 1=medium, 2=high, 3=critical
    """
    np.random.seed(42)
    X, y = [], []

    samples_per_class = n_samples // 4

    # ── Safe NFTs (label=0) ───────────────────────────────────────────────────
    for _ in range(samples_per_class):
        X.append([
            np.random.uniform(180, 1500),   # old contract
            np.random.uniform(0.35, 0.90),  # healthy owner ratio
            np.random.uniform(500, 50000),  # good volume
            np.random.uniform(50, 5000),    # active 7d
            np.random.uniform(0.5, 50),     # reasonable floor
            np.random.randint(1000, 15000), # decent supply
            np.random.randint(500, 12000),  # many owners
            np.random.uniform(2, 10),       # standard royalty
            1,                              # verified
            1,                              # has metadata
            1,                              # has website
            np.random.uniform(0, 0.15),     # low volatility
            np.random.uniform(0, 0.1),      # low wash trading
            np.random.uniform(0.05, 0.25),  # healthy listing ratio
        ])
        y.append(0)

    # ── Medium risk NFTs (label=1) ────────────────────────────────────────────
    for _ in range(samples_per_class):
        X.append([
            np.random.uniform(30, 180),     # newer contract
            np.random.uniform(0.20, 0.45),  # lower owner ratio
            np.random.uniform(10, 500),     # moderate volume
            np.random.uniform(1, 50),       # low 7d activity
            np.random.uniform(0.05, 0.5),   # lower floor
            np.random.randint(500, 5000),
            np.random.randint(100, 1500),
            np.random.uniform(10, 15),      # higher royalty
            np.random.choice([0, 1], p=[0.4, 0.6]),
            1,
            np.random.choice([0, 1], p=[0.3, 0.7]),
            np.random.uniform(0.1, 0.35),
            np.random.uniform(0.05, 0.25),
            np.random.uniform(0.2, 0.5),
        ])
        y.append(1)

    # ── High risk NFTs (label=2) ──────────────────────────────────────────────
    for _ in range(samples_per_class):
        X.append([
            np.random.uniform(5, 60),       # very new contract
            np.random.uniform(0.05, 0.25),  # concentrated ownership
            np.random.uniform(0, 20),       # low volume
            np.random.uniform(0, 5),        # very low 7d
            np.random.uniform(0, 0.1),      # near-zero floor
            np.random.randint(100, 2000),
            np.random.randint(10, 200),
            np.random.uniform(15, 25),      # high royalty
            0,                              # not verified
            np.random.choice([0, 1], p=[0.5, 0.5]),
            0,                              # no website
            np.random.uniform(0.3, 0.6),
            np.random.uniform(0.2, 0.5),
            np.random.uniform(0.4, 0.8),
        ])
        y.append(2)

    # ── Critical risk NFTs (label=3) ──────────────────────────────────────────
    for _ in range(samples_per_class):
        X.append([
            np.random.uniform(0, 14),       # brand new contract
            np.random.uniform(0, 0.1),      # whale concentration
            np.random.uniform(0, 5),        # near-zero volume
            np.random.uniform(0, 1),
            0,                              # zero floor
            np.random.randint(10, 500),
            np.random.randint(1, 30),       # almost no owners
            np.random.uniform(0, 2),        # zero royalty (rug signal)
            0,
            0,                              # no metadata
            0,
            np.random.uniform(0.5, 1.0),    # extreme volatility
            np.random.uniform(0.6, 1.0),    # high wash trading
            np.random.uniform(0.7, 1.0),    # most supply listed (dump signal)
        ])
        y.append(3)

    return np.array(X, dtype=np.float32), np.array(y)


class NFTRiskModel:
    """XGBoost NFT risk classifier."""

    def __init__(self):
        self.model       = None
        self.is_trained  = False
        self._train()

    def _train(self):
        try:
            import xgboost as xgb
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler

            X, y = generate_training_data(2000)
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            self.model = xgb.XGBClassifier(
                n_estimators    = 200,
                max_depth       = 6,
                learning_rate   = 0.1,
                subsample       = 0.8,
                colsample_bytree= 0.8,
                use_label_encoder=False,
                eval_metric     = "mlogloss",
                random_state    = 42,
                n_jobs          = -1,
            )
            self.model.fit(X_train, y_train)

            # Log accuracy
            acc = self.model.score(X_test, y_test)
            logger.info(f"✅ NFT Risk Model trained — accuracy: {acc:.2%}")
            self.is_trained = True

        except ImportError:
            logger.warning("XGBoost not installed — using fallback scoring")
        except Exception as e:
            logger.error(f"Model training failed: {e}")

    def predict(self, features: Dict[str, Any]) -> Dict:
        """
        Predict risk for a single NFT.
        Returns: { risk_score, risk_band, risk_label, probabilities, feature_importance }
        """
        feature_vector = np.array([[
            features.get("contract_age_days",    30),
            features.get("owner_ratio",          0.1),
            features.get("total_volume_eth",     0),
            features.get("seven_day_volume_eth", 0),
            features.get("floor_price_eth",      0),
            features.get("total_supply",         1000),
            features.get("num_owners",           100),
            features.get("royalty_pct",          5),
            features.get("is_verified",          0),
            features.get("has_metadata",         1),
            features.get("has_website",          0),
            features.get("price_volatility_7d",  0.3),
            features.get("wash_trade_score",     0.2),
            features.get("listing_ratio",        0.3),
        ]], dtype=np.float32)

        if self.is_trained and self.model:
            try:
                proba      = self.model.predict_proba(feature_vector)[0]
                pred_class = int(np.argmax(proba))

                # Convert class to risk score (0=safe→low score, 3=critical→high score)
                base_scores = [15, 42, 68, 88]
                risk_score  = int(base_scores[pred_class] + np.random.uniform(-8, 8))
                risk_score  = max(0, min(100, risk_score))

                return {
                    "risk_score":    risk_score,
                    "risk_band":     self._get_band(risk_score),
                    "risk_label":    ["safe", "medium", "high", "critical"][pred_class],
                    "probabilities": {
                        "safe":     round(float(proba[0]), 3),
                        "medium":   round(float(proba[1]), 3),
                        "high":     round(float(proba[2]), 3),
                        "critical": round(float(proba[3]), 3),
                    },
                    "model_used": "xgboost",
                }
            except Exception as e:
                logger.error(f"Prediction failed: {e}")

        # Fallback: rule-based scoring
        return self._rule_based_score(features)

    def _rule_based_score(self, features: Dict) -> Dict:
        """Rule-based fallback scoring."""
        score = 50  # start neutral

        score -= features.get("is_verified",   0) * 20
        score -= features.get("has_metadata",  0) * 10
        score += (1 - features.get("owner_ratio", 0.1)) * 20
        score += features.get("wash_trade_score", 0.2) * 20

        royalty = features.get("royalty_pct", 5)
        if royalty == 0:   score += 15  # zero royalty = rug signal
        if royalty > 15:   score += 10

        score = max(0, min(100, int(score)))
        return {
            "risk_score":  score,
            "risk_band":   self._get_band(score),
            "risk_label":  "high" if score > 60 else "medium" if score > 30 else "safe",
            "probabilities": {},
            "model_used": "rule_based",
        }

    def _get_band(self, score: int) -> str:
        if score < 30:  return "LOW"
        if score < 60:  return "MEDIUM"
        if score < 80:  return "HIGH"
        return "CRITICAL"

    def get_feature_importance(self) -> Dict[str, float]:
        if not (self.is_trained and self.model):
            return {}
        importance = self.model.feature_importances_
        return {
            name: round(float(imp), 4)
            for name, imp in zip(FEATURE_NAMES, importance)
        }


# ── Singleton instance ────────────────────────────────────────────────────────
_nft_model = None

def get_nft_model() -> NFTRiskModel:
    global _nft_model
    if _nft_model is None:
        logger.info("Initializing NFT risk model...")
        _nft_model = NFTRiskModel()
    return _nft_model
