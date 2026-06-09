package com.pitchheatmap.pitch_heatmap_api.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;


@Entity
@Data
@IdClass(PitchId.class)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PitchData {


    @Id
    private Long gamePk;


    @Id
    private Integer atBatNumber;


    @Id    
    private Integer pitchNumber;


    // -------------------------
    // PITCHER
    // -------------------------

    // Pitch Identity = 2
    private String pitchType;
    private String pitchName;

    // Release & Velocity = 6
    private Double releaseSpeed;
    private Double effectiveSpeed;

    @Column(name = "release_pos_x")
    private Double releasePosX;

    @Column(name = "release_pos_z")
    private Double releasePosZ;

    @Column(name = "release_pos_y")
    private Double releasePosY;
    private Double releaseExtension;

    // Pitch Movement = 5
    @Column(name = "pfx_x")
    private Double pfxX;
    @Column(name = "pfx_z")
    private Double pfxZ;

    @JsonProperty("api_break_z_with_gravity")
    @Column(name = "api_break_z_with_gravity")
    private Double apiBreakZWithGravity;

    @JsonProperty("api_break_x_arm")
    @Column(name = "api_break_x_arm")
    private Double apiBreakXArm;

    @JsonProperty("api_break_x_batter_in")
    @Column(name = "api_break_x_batter_in")
    private Double apiBreakXBatterIn;

    // Spin = 2
    private Double releaseSpinRate;
    private Double spinAxis;

    // Pitch Location = 5
    @Column(name = "plate_x")
    private Double plateX;
    @Column(name = "plate_z")
    private Double plateZ;
    private Integer zone;
    private Double szTop;
    private Double szBot;

    // Physics / Trajectory = 6
    private Double vx0;
    private Double vy0;
    private Double vz0;
    private Double ax;
    private Double ay;
    private Double az;

    // Arm Angle = 1
    private Double armAngle;

    // Pitcher Info = 6
    private String playerName;
    private Long pitcher;
    private String pThrows;
    private Integer agePit;
    private Integer agePitLegacy;
    private Integer nThruorderPitcher;










    // -------------------------
    // BATTER
    // -------------------------

    // Batter Info = 5
    private Long batter;
    private String batterName;
    private String stand;
    private Integer ageBat;
    private Integer ageBatLegacy;
    private Integer nPriorpaThisgamePlayerAtBat;

    // Pitch Outcome = 4
    private String events;
    private String description;
    private String type;
    private String des;

    // Hit Data = 7
    private Integer hitLocation;
    private String bbType;
    @Column(name = "hc_x")
    private Double hcX;
    @Column(name = "hc_y")
    private Double hcY;
    private Double hitDistanceSc;
    private Double launchSpeed;
    private Double launchAngle;

    // Swing Metrics = 8
    private Double batSpeed;
    private Double swingLength;
    private Double attackAngle;
    private Double attackDirection;
    private Double swingPathTilt;
    private Double hyperSpeed;

    @JsonProperty("intercept_ball_minus_batter_pos_x_inches")
    @Column(name = "intercept_ball_minus_batter_pos_x_inches")
    private Double interceptBallMinusBatterPosXInches;

    @JsonProperty("intercept_ball_minus_batter_pos_y_inches")
    @Column(name = "intercept_ball_minus_batter_pos_y_inches")
    private Double interceptBallMinusBatterPosYInches;

    // -------------------------
    // GAME INFORMATION
    // -------------------------

    // Game Identity = 5
    private LocalDate gameDate;
    private Integer gameYear;
    private String gameType;
    private String homeTeam;
    private String awayTeam;

    // Game Situation = 8
    private Integer inning;
    private String inningTopbot;
    private Integer balls;
    private Integer strikes;
    private Integer outsWhenUp;
    @JsonProperty("on_1b")
    private Long on1b;
    @JsonProperty("on_2b")
    private Long on2b;
    @JsonProperty("on_3b")
    private Long on3b;
    private Integer homeScore;
    private Integer awayScore;
}
