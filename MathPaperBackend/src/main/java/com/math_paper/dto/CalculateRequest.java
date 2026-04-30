package com.math_paper.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record CalculateRequest(
        String latex,
        JsonNode mathJson
) {
}
