package com.math_paper.dto;

public record GradingInfo(
        String standardLatex,
        String studentLatex,
        String standardAnswerValue,
        String studentAnswerValue,
        String calculateResult,
        String errorReason,
        String judgeDetail,
        Integer equivalent
) {
}
