package com.pitchheatmap.pitch_heatmap_api.dto;

import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ActivePitcher(
        Long mlbamId,
        String name,
        Integer paAgainst
) {}