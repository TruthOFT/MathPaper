package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.AuthRequest;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.service.AuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Result<AuthUserResponse> register(@RequestBody AuthRequest request, HttpSession session) {
        return RestUtil.success(authService.register(request, session));
    }

    @PostMapping("/login")
    public Result<AuthUserResponse> login(@RequestBody AuthRequest request, HttpSession session) {
        return RestUtil.success(authService.login(request, session));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpSession session) {
        authService.logout(session);
        return RestUtil.success();
    }

    @GetMapping("/me")
    public Result<AuthUserResponse> me(HttpSession session) {
        return RestUtil.success(authService.me(session));
    }
}
