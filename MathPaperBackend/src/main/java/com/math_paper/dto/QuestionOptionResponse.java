package com.math_paper.dto;

public record QuestionOptionResponse(
        Long id,
        String optionKey,
        String optionContent,
        Integer isCorrect,
        Integer sortNo
) {
}
