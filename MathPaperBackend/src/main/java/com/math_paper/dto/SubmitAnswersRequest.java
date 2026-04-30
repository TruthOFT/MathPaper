package com.math_paper.dto;

import java.util.List;

public record SubmitAnswersRequest(
        Long taskStudentId,
        List<SubmitAnswerItem> answers
) {
}
