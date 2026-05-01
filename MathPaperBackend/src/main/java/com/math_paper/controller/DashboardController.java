package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.DashboardSummaryResponse;
import com.math_paper.service.DashboardService;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public Result<DashboardSummaryResponse> summary(HttpSession session) {
        AuthUserResponse user = SessionUtil.requireLogin(session);
        return RestUtil.success(dashboardService.summary(user));
    }
}
