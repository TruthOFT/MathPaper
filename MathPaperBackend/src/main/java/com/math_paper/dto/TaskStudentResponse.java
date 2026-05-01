package com.math_paper.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TaskStudentResponse(
        Long taskStudentId,
        Long studentId,
        String studentName,
        String studentNo,
        String status,
        BigDecimal totalScore,
        LocalDateTime submitTime,
        Long wrongCount
) {
}
