package com.pitchheatmap.pitch_heatmap_api.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pitchheatmap.pitch_heatmap_api.dto.ActivePitcher;
import com.pitchheatmap.pitch_heatmap_api.dto.GameSummary;
import com.pitchheatmap.pitch_heatmap_api.model.PitchData;
import com.pitchheatmap.pitch_heatmap_api.service.PitchDataService;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class PitchDataController {

    @Autowired
    private PitchDataService pitchDataService;

   

    // List of active pitchers for the dropdown. Defaults to current season. 
    @GetMapping("/pitchers/active")
    public ResponseEntity<List<ActivePitcher>> getActivePitchers(
            @RequestParam(required = false) Integer season) {
        return ResponseEntity.ok(pitchDataService.getActivePitchers(season));
    }

    // MIGHT USE THIS LATER FOR PAST PITCHERS
    // @GetMapping("/pitchers/search")
    // public ResponseEntity<List<Map<String, Object>>> searchPitcher(
    //         @RequestParam String first,
    //         @RequestParam String last) {
    //     return ResponseEntity.ok(pitchDataService.searchPitcher(first, last));
    // }


    
     // Games this pitcher pitched in for the given season (regular season only).
     // Auto-fetches from pybaseball if not cached.
    
    @GetMapping("/pitchers/{mlbamId}/games")
    public ResponseEntity<List<GameSummary>> getGamesBySeason(
            @PathVariable Long mlbamId,
            @RequestParam Integer season) {
        return ResponseEntity.ok(pitchDataService.getGamesByPitcherAndSeason(mlbamId, season));
    }

    // All pitches in one game, ordered by sequence 
    @GetMapping("/pitchers/{mlbamId}/games/{gamePk}/pitches")
    public ResponseEntity<List<PitchData>> getPitchesByGame(
            @PathVariable Long mlbamId,
            @PathVariable Long gamePk) {
        return ResponseEntity.ok(pitchDataService.getPitchesByPitcherAndGame(mlbamId, gamePk));
    }








    @PostMapping("/pitchers/{mlbamId}/fetch")
    public ResponseEntity<Map<String, Object>> fetchPitcher(
            @PathVariable Long mlbamId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest().body(Map.of("error", "endDate before startDate"));
        }
        if (startDate.plusYears(1).isBefore(endDate)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Range > 1 year — narrow it"));
        }

        List<PitchData> saved = pitchDataService.fetchAndStorePitches(mlbamId, startDate, endDate);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "pitches_saved", saved.size(),
                "mlbam_id", mlbamId
        ));
    }
}