package com.pitchheatmap.pitch_heatmap_api.service;

import com.pitchheatmap.pitch_heatmap_api.model.PitchData;
import com.pitchheatmap.pitch_heatmap_api.dto.ActivePitcher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class PybaseballClient {

    private final WebClient client;

    public PybaseballClient(WebClient pybaseballWebClient) {
        this.client = pybaseballWebClient;
    }

    // // Look up a pitcher's MLBAM id by name. SAVING FOR LATER
    // public List<Map<String, Object>> lookupPitcher(String first, String last) {
    //     try {
    //         return client.get()
    //                 .uri(uri -> uri.path("/pitcher/lookup")
    //                         .queryParam("first", first)
    //                         .queryParam("last", last)
    //                         .build())
    //                 .retrieve()
    //                 .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
    //                 .timeout(Duration.ofSeconds(30))
    //                 .block();
    //     } catch (WebClientResponseException.NotFound e) {
    //         return Collections.emptyList();
    //     }
    // }

    // Pull all pitches thrown by this MLBAM id between start and end (inclusive). 
    public List<PitchData> fetchPitcherPitches(long mlbamId, LocalDate start, LocalDate end) {
        List<PitchData> result = client.get()
                .uri(uri -> uri.path("/pitcher/{id}/statcast")
                        .queryParam("start_dt", start.toString())
                        .queryParam("end_dt", end.toString())
                        .build(mlbamId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PitchData>>() {})
                .timeout(Duration.ofSeconds(120)) // first call can be slow (statcast cold cache)
                .block();
        return result == null ? Collections.emptyList() : result;
    }

    public List<ActivePitcher> getActivePitchers(Integer season) {
        return client.get()
                .uri(uri -> {
                    var b = uri.path("/pitchers/active");
                    if (season != null) b.queryParam("season", season);
                    return b.build();
                })
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ActivePitcher>>() {})
                .timeout(Duration.ofSeconds(60))
                .block();
    }
}