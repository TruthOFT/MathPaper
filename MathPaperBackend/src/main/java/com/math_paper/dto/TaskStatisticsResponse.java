package com.math_paper.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record TaskStatisticsResponse(
        Long taskId,
        String taskName,
        int totalStudents,
        int submittedCount,
        int pendingCount,
        double submissionRate,
        BigDecimal averageScore,
        BigDecimal maxScore,
        BigDecimal minScore,
        Map<String, Integer> scoreDistribution,
        List<QuestionStat> perQuestionStats,
        List<WeakKpStat> weakKnowledgePoints
) {
    public record QuestionStat(
            Long paperQuestionId,
            Integer questionNo,
            String questionType,
            BigDecimal score,
            String stemContent,
            long attemptCount,
            long correctCount,
            double correctRate
    ) {
    }

    public record WeakKpStat(
            Long knowledgePointId,
            String pointName,
            long wrongCount
    ) {
    }
}
