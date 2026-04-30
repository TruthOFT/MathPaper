package com.math_paper.common;

public record Result<T>(
        int code,
        String message,
        T data
) {
}
