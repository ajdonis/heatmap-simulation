package com.pitchheatmap.pitch_heatmap_api.model;

public record PitcherSummary(
        Long pitcherId,
        String name,
        String displayName,
        String team,
        String position
) {}