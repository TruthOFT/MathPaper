package com.math_paper.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WrongQuestionResponse(
        Long id,
        Long taskStudentId,
        Long questionId,
        Long paperQuestionId,
        String taskName,
        String stemContent,
        String studentAnswer,
        String standardAnswer,
        String analysisContent,
        String wrongReason,
        Integer reviewCount,
        Integer mastered,
        LocalDateTime wrongTime,
        List<QuestionOptionResponse> options
) {
}
