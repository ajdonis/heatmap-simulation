package com.pitchheatmap.pitch_heatmap_api.service;

import java.time.LocalDate;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;


import org.springframework.stereotype.Service;

import com.pitchheatmap.pitch_heatmap_api.dto.ActivePitcher;
import com.pitchheatmap.pitch_heatmap_api.dto.GameSummary;
import com.pitchheatmap.pitch_heatmap_api.model.PitchData;
import com.pitchheatmap.pitch_heatmap_api.model.PitchId;
import com.pitchheatmap.pitch_heatmap_api.repo.PitchDataRepository;



@Service
public class PitchDataService {

    private final PitchDataRepository pitchDataRepository;
    private final PybaseballClient pybaseballClient;


    public PitchDataService(PitchDataRepository pitchDataRepository, PybaseballClient pybaseballClient) {
        this.pitchDataRepository = pitchDataRepository;
        this.pybaseballClient = pybaseballClient;
    }

    


    public List<ActivePitcher> getActivePitchers(Integer season) {
        return pybaseballClient.getActivePitchers(season);
    }

    /**
     * Returns games for a pitcher in a given season. If we don't have any cached
     * for this pitcher/season, fetch the whole season from pybaseball first.
     */
    public List<GameSummary> getGamesByPitcherAndSeason(Long mlbamId, Integer season) {
        List<GameSummary> games = pitchDataRepository.findGameSummariesByPitcherAndSeason(mlbamId, season);
        if (!games.isEmpty()) return games;

        // No cache — fetch the season range
        LocalDate seasonStart = LocalDate.of(season, 3, 1);
        LocalDate seasonEnd = LocalDate.of(season, 11, 30);
        LocalDate today = LocalDate.now();
        if (seasonEnd.isAfter(today)) seasonEnd = today;
        if (seasonStart.isAfter(today)) {
            return List.of();
        }

        fetchAndStorePitches(mlbamId, seasonStart, seasonEnd);
        return pitchDataRepository.findGameSummariesByPitcherAndSeason(mlbamId, season);
    }


    public List<PitchData> getPitchesByPitcherAndGame(Long pitcher, Long gamePk) {
        return pitchDataRepository.findPitchesByPitcherAndGame(pitcher, gamePk);
    }

    // /** Search MLBAM directory by name. SAVING FOR LATER */
    // public List<Map<String, Object>> searchPitcher(String first, String last) {
    //     return pybaseballClient.lookupPitcher(first, last);
    // }



    public List<PitchData> fetchAndStorePitches(long mlbamId, LocalDate start, LocalDate end) {
        List<PitchData> pitches = pybaseballClient.fetchPitcherPitches(mlbamId, start, end);
        if (pitches.isEmpty()) return pitches;

        // Dedupe by composite key — pybaseball occasionally returns duplicates,
        // and skip rows missing any of the three ID fields (can't insert without them)
        Map<PitchId, PitchData> deduped = new LinkedHashMap<>();
        for (PitchData p : pitches) {
            if (p.getGamePk() == null || p.getAtBatNumber() == null || p.getPitchNumber() == null) {
                continue;
            }
            PitchId key = new PitchId(p.getGamePk(), p.getAtBatNumber(), p.getPitchNumber());
            deduped.put(key, p); 
        }

        List<PitchData> unique = new ArrayList<>(deduped.values());
        pitchDataRepository.saveAll(unique);
        return unique;
    }




}