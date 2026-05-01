package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.WrongQuestionResponse;
import com.math_paper.service.WrongQuestionService;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/wrong-questions")
@RequiredArgsConstructor
public class WrongQuestionController {

    private final WrongQuestionService wrongQuestionService;

    @GetMapping("/mine")
    public Result<List<WrongQuestionResponse>> mine(HttpSession session) {
        AuthUserResponse student = SessionUtil.requireRole(session, "student");
        return RestUtil.success(wrongQuestionService.listMine(student));
    }

    @PostMapping("/{id}/review")
    public Result<WrongQuestionResponse> review(@PathVariable Long id, HttpSession session) {
        AuthUserResponse student = SessionUtil.requireRole(session, "student");
        return RestUtil.success(wrongQuestionService.review(id, student));
    }

    @PostMapping("/{id}/mastered")
    public Result<WrongQuestionResponse> mastered(@PathVariable Long id, HttpSession session) {
        AuthUserResponse student = SessionUtil.requireRole(session, "student");
        return RestUtil.success(wrongQuestionService.mastered(id, student));
    }
}
