package com.math_paper.dto;

import java.math.BigDecimal;

public record PaperResponse(
        Long id,
        String paperCode,
        String paperName,
        Integer questionCount,
        BigDecimal totalScore
) {
}
