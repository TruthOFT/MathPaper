package com.math_paper.dto;

public record AuthRequest(
        String username,
        String password,
        String roleType,
        String realName
) {
}
