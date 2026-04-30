package com.math_paper.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TaskSummaryResponse(
        Long taskId,
        Long taskStudentId,
        Long paperId,
        String taskName,
        String status,
        BigDecimal totalScore,
        LocalDateTime deadlineTime
) {
}
