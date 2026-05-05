package com.math_paper.dto;

import java.time.LocalDateTime;

public record StudentResponse(
        Long id,
        String username,
        String realName,
        String phone,
        String email,
        Integer status,
        Long classId,
        String className,
        String studentNo,
        LocalDateTime joinTime,
        LocalDateTime createTime,
        LocalDateTime updateTime
) {
}
