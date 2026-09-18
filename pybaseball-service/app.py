from fastapi import FastAPI, HTTPException, Query
from pybaseball import (
    statcast_pitcher,
    playerid_reverse_lookup,  
    statcast_pitcher_expected_stats, 
    cache,
)
from datetime import datetime
from typing import Optional
import pandas as pd
import math

# Pybaseball caches API responses locally so repeated calls for the same data don't hit the external servers again. 
#Important because Baseball Reference and Statcast calls can take 10-30 seconds on a cold cache.
cache.enable()

app = FastAPI(title="pybaseball-bridge")



#Converts a pandas DataFrame to a list of JSON-safe dicts.
#This replaces all NaN/NaT with None so FastAPI can serialize the response correctly.
#Used by every endpoint that returns data.

def clean_records(df: pd.DataFrame) -> list[dict]:
    if df.empty:
        return []
    df = df.astype(object).where(pd.notnull(df), None)
    records = df.to_dict(orient="records")
    for rec in records:
        for k, v in rec.items():
            if isinstance(v, float) and math.isnan(v):
                rec[k] = None
    return records



#Adds a 'batter_name' column to a Statcast DataFrame.
#This does a batched reverse lookup to add names so the Spring backend and frontend can display them.
def enrich_with_batter_names(df: pd.DataFrame) -> pd.DataFrame:
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




#Health check
@app.get("/health")
def health():
    return {"status": "ok"}



 #Returns every pitch thrown in a game by a specific pitcher.
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




#Returns a list of all pitchers currently playing.
@app.get("/pitchers/active")
def active_pitchers(season: Optional[int] = Query(None)):
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


