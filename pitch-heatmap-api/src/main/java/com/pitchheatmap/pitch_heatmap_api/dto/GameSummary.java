package com.pitchheatmap.pitch_heatmap_api.dto;

import java.time.LocalDate;

public record GameSummary(
        Long gamePk,
        LocalDate gameDate,
        String homeTeam,
        String awayTeam,
        Long totalPitches
) {}