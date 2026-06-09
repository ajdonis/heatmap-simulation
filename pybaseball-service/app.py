from fastapi import FastAPI, HTTPException, Query
from pybaseball import (
    statcast_pitcher,
    playerid_reverse_lookup,
    statcast_pitcher_expected_stats,
    cache,
)
from datetime import datetime
import pandas as pd
import math

cache.enable()

app = FastAPI(title="pybaseball-bridge")


def clean_records(df: pd.DataFrame) -> list[dict]:
    """pandas NaN is invalid JSON; replace with None and ensure native types."""
    if df.empty:
        return []
    df = df.astype(object).where(pd.notnull(df), None)
    records = df.to_dict(orient="records")
    for rec in records:
        for k, v in rec.items():
            if isinstance(v, float) and math.isnan(v):
                rec[k] = None
    return records


def enrich_with_batter_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds a batter_name column by reverse-looking-up each unique batter
    mlbam ID. Batched into a single lookup so we don't hit the service
    once per row.
    """
    if df.empty or "batter" not in df.columns:
        return df

    unique_ids = df["batter"].dropna().astype(int).unique().tolist()
    if not unique_ids:
        df["batter_name"] = None
        return df

    lookup = playerid_reverse_lookup(unique_ids, key_type="mlbam")
    name_map = {
        int(row["key_mlbam"]): f"{row['name_first']} {row['name_last']}"
        for _, row in lookup.iterrows()
    }
    df["batter_name"] = df["batter"].map(
        lambda x: name_map.get(int(x)) if pd.notna(x) else None
    )
    return df


@app.get("/health")
def health():
    return {"status": "ok"}


# MIGHT USE LATER FOR PAST PITCHERS
# @app.get("/pitcher/lookup")
# def lookup(first: str = Query(...), last: str = Query(...)):
#     df = playerid_lookup(last, first)
#     if df.empty:
#         raise HTTPException(404, f"No player found for {first} {last}")
#     return clean_records(df)


@app.get("/pitcher/{mlbam_id}/statcast")
def pitcher_statcast(
    mlbam_id: int,
    start_dt: str = Query(..., description="YYYY-MM-DD"),
    end_dt: str = Query(..., description="YYYY-MM-DD"),
):
    try:
        df = statcast_pitcher(start_dt, end_dt, mlbam_id)
    except Exception as e:
        raise HTTPException(502, f"pybaseball error: {e}")
    df = enrich_with_batter_names(df)
    return clean_records(df)


@app.get("/pitchers/active")
def active_pitchers(season: int | None = Query(None)):
    if season is None:
        season = datetime.now().year

    try:
        df = statcast_pitcher_expected_stats(season, minPA=1)
    except Exception as e:
        raise HTTPException(502, f"Statcast leaderboard fetch failed: {e}")

    if df.empty:
        return []

    df = df.dropna(subset=["player_id"])

    return [
        {
            "mlbam_id": int(row["player_id"]),
            "name": row["last_name, first_name"],
            "pa_against": int(row["pa"]) if pd.notna(row.get("pa")) else 0,
        }
        for _, row in df.iterrows()
    ]