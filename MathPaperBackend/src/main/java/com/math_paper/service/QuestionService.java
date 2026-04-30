package com.math_paper.service;

import com.math_paper.dto.QuestionRequest;
import com.math_paper.dto.QuestionResponse;

import java.util.List;

public interface QuestionService {
    List<QuestionResponse> list(String questionType);

    QuestionResponse detail(Long id);

    QuestionResponse save(QuestionRequest request);

    void delete(Long id);
}
