package com.math_paper.dto;

import java.util.List;

public record TaskDetailResponse(
        Long taskId,
        Long taskStudentId,
        Long paperId,
        String taskName,
        String status,
        List<PaperQuestionResponse> questions
) {
}
