package com.math_paper.dto;

import java.io.Serializable;

public record AuthUserResponse(
        Long id,
        String username,
        String roleType,
        String realName
) implements Serializable {
}
