package com.math_paper.service;

import jakarta.servlet.http.HttpSession;
import com.math_paper.dto.AuthRequest;
import com.math_paper.dto.AuthUserResponse;

public interface AuthService {
    AuthUserResponse register(AuthRequest request, HttpSession session);

    AuthUserResponse login(AuthRequest request, HttpSession session);

    AuthUserResponse me(HttpSession session);

    void logout(HttpSession session);
}
