package com.math_paper.dto;

public record PublishTaskRequest(
        Long paperId,
        String taskName,
        Long classId,
        Integer deadlineDays
) {
}
