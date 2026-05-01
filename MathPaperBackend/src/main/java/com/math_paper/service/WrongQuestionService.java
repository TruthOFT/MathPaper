package com.math_paper.service;

import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.WrongQuestionResponse;

import java.util.List;

public interface WrongQuestionService {
    List<WrongQuestionResponse> listMine(AuthUserResponse student);

    WrongQuestionResponse review(Long id, AuthUserResponse student);

    WrongQuestionResponse mastered(Long id, AuthUserResponse student);
}
