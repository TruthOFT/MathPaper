package com.math_paper.controller;

import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.StudentRequest;
import com.math_paper.dto.StudentResponse;
import com.math_paper.service.StudentManagementService;
import com.math_paper.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentManagementController {

    private final StudentManagementService studentManagementService;

    @GetMapping
    public Result<List<StudentResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long classId,
            HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(studentManagementService.list(keyword, classId));
    }

    @PostMapping
    public Result<StudentResponse> save(@RequestBody StudentRequest request, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(studentManagementService.save(request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        studentManagementService.delete(id);
        return RestUtil.success();
    }
}
