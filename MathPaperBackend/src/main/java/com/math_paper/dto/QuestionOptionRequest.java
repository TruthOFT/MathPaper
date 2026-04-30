package com.math_paper.dto;

public record QuestionOptionRequest(
        String optionKey,
        String optionContent,
        Integer isCorrect,
        Integer sortNo
) {
}
