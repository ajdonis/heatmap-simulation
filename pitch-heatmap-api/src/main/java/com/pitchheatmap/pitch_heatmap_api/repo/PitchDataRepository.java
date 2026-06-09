package com.pitchheatmap.pitch_heatmap_api.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pitchheatmap.pitch_heatmap_api.dto.GameSummary;
import com.pitchheatmap.pitch_heatmap_api.model.PitchData;
import com.pitchheatmap.pitch_heatmap_api.model.PitchId;

@Repository
public interface PitchDataRepository extends JpaRepository<PitchData, PitchId>{

    
    // ORDER BY added so the scrubber gets pitches in game sequence
    @Query("""
            SELECT p FROM PitchData p
            WHERE p.pitcher = :pitcher AND p.gamePk = :gamePk
            ORDER BY p.atBatNumber ASC, p.pitchNumber ASC
            """)
    List<PitchData> findPitchesByPitcherAndGame(@Param("pitcher") Long pitcher, @Param("gamePk") Long gamePk);


    // Rich game summaries for the season dropdown (regular season only)
    @Query("""
            SELECT new com.pitchheatmap.pitch_heatmap_api.dto.GameSummary(
                p.gamePk, MIN(p.gameDate), MIN(p.homeTeam), MIN(p.awayTeam), COUNT(p)
            )
            FROM PitchData p
            WHERE p.pitcher = :mlbamId
              AND p.gameYear = :season
              AND p.gameType = 'R'
            GROUP BY p.gamePk
            ORDER BY MIN(p.gameDate)
            """)
    List<GameSummary> findGameSummariesByPitcherAndSeason(
            @Param("mlbamId") Long mlbamId,
            @Param("season") Integer season);

    
}
