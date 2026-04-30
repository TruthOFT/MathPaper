package com.math_paper.dto;

import java.math.BigDecimal;
import java.util.List;

public record QuestionRequest(
        Long id,
        String questionType,
        String inputType,
        String stemContent,
        String answerContent,
        String answerValue,
        String analysisContent,
        BigDecimal difficulty,
        BigDecimal defaultScore,
        Integer blankCount,
        Integer estimatedMinutes,
        List<Long> knowledgePointIds,
        List<QuestionOptionRequest> options
) {
}
