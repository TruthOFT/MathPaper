package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.QuestionRequest;
import com.math_paper.dto.QuestionResponse;
import com.math_paper.service.QuestionService;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public Result<List<QuestionResponse>> list(@RequestParam(required = false) String questionType, HttpSession session) {
        SessionUtil.requireLogin(session);
        return RestUtil.success(questionService.list(questionType));
    }

    @GetMapping("/{id}")
    public Result<QuestionResponse> detail(@PathVariable Long id, HttpSession session) {
        SessionUtil.requireLogin(session);
        return RestUtil.success(questionService.detail(id));
    }

    @PostMapping
    public Result<QuestionResponse> save(@RequestBody QuestionRequest request, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(questionService.save(request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        questionService.delete(id);
        return RestUtil.success();
    }
}
