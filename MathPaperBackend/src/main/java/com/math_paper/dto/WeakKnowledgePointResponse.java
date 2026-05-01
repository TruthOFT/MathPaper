package com.math_paper.dto;

public record WeakKnowledgePointResponse(
        Long knowledgePointId,
        String pointName,
        Long wrongCount
) {
}
