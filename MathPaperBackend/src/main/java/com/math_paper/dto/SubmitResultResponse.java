package com.math_paper.dto;

import java.math.BigDecimal;

public record SubmitResultResponse(
        Long taskStudentId,
        String status,
        BigDecimal totalScore
) {
}
