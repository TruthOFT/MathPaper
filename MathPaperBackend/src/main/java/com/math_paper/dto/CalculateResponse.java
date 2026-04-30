package com.math_paper.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record CalculateResponse(
        String latex,
        JsonNode mathJson,
        String symjaExpression,
        String result,
        String resultLatex,
        String message
) {
}
