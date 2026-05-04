package com.math_paper.dto;

import java.math.BigDecimal;
import java.util.List;

public record PaperQuestionResponse(
        Long id,
        Long questionId,
        Integer questionNo,
        String sectionName,
        String questionType,
        BigDecimal score,
        String stemContent,
        String answerContent,
        String answerValue,
        String analysisContent,
        String studentAnswer,
        String judgeResult,
        BigDecimal judgeScore,
        List<QuestionOptionResponse> options,
        GradingInfo gradingInfo
) {
}
