package com.math_paper.dto;

public record StudentRequest(
        Long id,
        String username,
        String password,
        String realName,
        String phone,
        String email,
        Integer status,
        Long classId,
        String studentNo
) {
}
