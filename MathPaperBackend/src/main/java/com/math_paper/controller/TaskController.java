package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.PublishTaskRequest;
import com.math_paper.dto.SubmitAnswersRequest;
import com.math_paper.dto.SubmitResultResponse;
import com.math_paper.dto.TaskDetailResponse;
import com.math_paper.dto.TaskStudentResponse;
import com.math_paper.dto.TaskSummaryResponse;
import com.math_paper.service.TaskService;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/publish")
    public Result<TaskSummaryResponse> publish(@RequestBody PublishTaskRequest request, HttpSession session) {
        AuthUserResponse teacher = SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(taskService.publish(request, teacher));
    }

    @GetMapping("/mine")
    public Result<List<TaskSummaryResponse>> mine(HttpSession session) {
        AuthUserResponse user = SessionUtil.requireLogin(session);
        return RestUtil.success(taskService.listMyTasks(user));
    }

    @GetMapping("/{taskId}/students")
    public Result<List<TaskStudentResponse>> students(@PathVariable Long taskId, HttpSession session) {
        AuthUserResponse teacher = SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(taskService.listTaskStudents(taskId, teacher));
    }

    @GetMapping("/student/{taskStudentId}")
    public Result<TaskDetailResponse> detail(@PathVariable Long taskStudentId, HttpSession session) {
        AuthUserResponse user = SessionUtil.requireLogin(session);
        return RestUtil.success(taskService.detail(taskStudentId, user));
    }

    @PostMapping("/submit")
    public Result<SubmitResultResponse> submit(@RequestBody SubmitAnswersRequest request, HttpSession session) {
        AuthUserResponse student = SessionUtil.requireRole(session, "student");
        return RestUtil.success(taskService.submit(request, student));
    }
}
