package com.pitchheatmap.pitch_heatmap_api.model;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PitchId implements Serializable {

    private Long gamePk;
    private Integer atBatNumber;
    private Integer pitchNumber;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PitchId)) return false;
        PitchId that = (PitchId) o;
        return Objects.equals(gamePk, that.gamePk) &&
               Objects.equals(atBatNumber, that.atBatNumber) &&
               Objects.equals(pitchNumber, that.pitchNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(gamePk, atBatNumber, pitchNumber);
    }
}
