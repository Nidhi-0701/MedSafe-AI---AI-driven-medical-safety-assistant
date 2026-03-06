"""
Medicine interaction checker using fuzzy matching against a dataset.

Returns interaction level, explanation, and safety note.
"""

import json
import os
from pathlib import Path
from typing import List, Tuple

from rapidfuzz import fuzz, process

# In-memory medicine interaction data (can be replaced by DB or external API)
# Format: list of { "medicines": ["drug_a", "drug_b"], "level": "HIGH|MEDIUM|LOW", "explanation": "...", "safety_note": "..." }
INTERACTIONS_DATA: List[dict] = []


def _load_interactions_data() -> List[dict]:
    """Load interaction dataset from JSON file if present, else use built-in defaults."""
    global INTERACTIONS_DATA
    if INTERACTIONS_DATA:
        return INTERACTIONS_DATA
    data_path = Path(__file__).parent.parent / "data" / "interactions.json"
    if data_path.exists():
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                INTERACTIONS_DATA = json.load(f)
            return INTERACTIONS_DATA
        except Exception:
            pass
    # Default examples for common OTC combinations
    INTERACTIONS_DATA = [
        {
            "medicines": ["paracetamol", "ibuprofen"],
            "level": "LOW",
            "explanation": "Both can be used in sequence (e.g. staggered) for fever/pain under guidance; taking together routinely may increase stomach/bleeding risk.",
            "safety_note": "Use one at a time or as advised by a doctor; do not exceed recommended doses.",
        },
        {
            "medicines": ["aspirin", "ibuprofen"],
            "level": "MEDIUM",
            "explanation": "Both are NSAIDs. Combined use can increase risk of stomach irritation and bleeding.",
            "safety_note": "Avoid taking together; consult a doctor before combining.",
        },
        {
            "medicines": ["warfarin", "aspirin"],
            "level": "HIGH",
            "explanation": "Both affect blood clotting. Combined use significantly increases bleeding risk.",
            "safety_note": "Do not combine without medical supervision.",
        },
    ]
    return INTERACTIONS_DATA


def _normalize_medicine_name(name: str) -> str:
    """Lowercase and strip for matching."""
    return (name or "").strip().lower()


def _fuzzy_match_medicine(user_medicine: str, known_medicines: List[str]) -> Tuple[str, int]:
    """
    Find best match for user input from a list of known medicine names.
    Returns (matched_name, score).
    """
    user_medicine = _normalize_medicine_name(user_medicine)
    if not known_medicines:
        return user_medicine, 0
    # Build flat list of known names for matching
    choice = process.extractOne(user_medicine, known_medicines, scorer=fuzz.ratio)
    return (choice[0], choice[1]) if choice else (user_medicine, 0)


def check_interaction(medicines: List[str]) -> dict:
    """
    Check interaction between a list of medicines using fuzzy matching.

    Returns:
        {
            "interaction_level": "NONE" | "LOW" | "MEDIUM" | "HIGH",
            "explanation": str,
            "safety_note": str,
            "matched_medicines": [str],
            "known_interaction": bool
        }
    """
    if not medicines or len(medicines) < 2:
        return {
            "interaction_level": "NONE",
            "explanation": "Two or more medicines are needed to check for interactions.",
            "safety_note": "Always inform your doctor about all medicines you take.",
            "matched_medicines": list(medicines) if medicines else [],
            "known_interaction": False,
        }
    data = _load_interactions_data()
    # Build set of all known medicine names from dataset
    all_known = set()
    for item in data:
        for m in item.get("medicines", []):
            all_known.add(_normalize_medicine_name(m))
    all_known = list(all_known)
    # Normalize and fuzzy-match user input
    normalized_input = [_normalize_medicine_name(m) for m in medicines]
    matched = []
    for m in normalized_input:
        name, _ = _fuzzy_match_medicine(m, all_known)
        matched.append(name)
    # Check each pair in our dataset (order-independent)
    best_level = "NONE"
    best_explanation = "No known significant interaction found for the entered medicines. This does not guarantee safety."
    best_safety = "Always inform your doctor or pharmacist about all medicines and supplements you take."
    found = False
    for item in data:
        drug_set = set(_normalize_medicine_name(x) for x in item.get("medicines", []))
        if len(drug_set) < 2:
            continue
        matched_set = set(matched)
        if drug_set <= matched_set or drug_set.issubset(matched_set):
            level = item.get("level", "LOW")
            if _level_rank(level) > _level_rank(best_level):
                best_level = level
                best_explanation = item.get("explanation", best_explanation)
                best_safety = item.get("safety_note", best_safety)
                found = True
    return {
        "interaction_level": best_level,
        "explanation": best_explanation,
        "safety_note": best_safety,
        "matched_medicines": list(medicines),
        "known_interaction": found,
    }


def _level_rank(level: str) -> int:
    """Rank for comparing severity (higher = more severe)."""
    return {"NONE": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3}.get((level or "").upper(), 0)
