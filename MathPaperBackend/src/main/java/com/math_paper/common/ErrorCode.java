package com.math_paper.common;

public enum ErrorCode {
    SUCCESS(0, "成功"),
    PARAM_ERROR(40000, "参数错误"),
    NOT_LOGIN(40100, "未登录"),
    NO_AUTH(40300, "无权限"),
    ACCOUNT_EXISTS(40001, "账号已存在"),
    ACCOUNT_PASSWORD_ERROR(40002, "账号或密码错误"),
    NOT_FOUND(40400, "资源不存在"),
    BUSINESS_ERROR(50000, "业务异常"),
    SYSTEM_ERROR(50001, "系统异常");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
