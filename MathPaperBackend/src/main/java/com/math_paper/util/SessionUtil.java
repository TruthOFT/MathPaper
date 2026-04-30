package com.math_paper.util;

import jakarta.servlet.http.HttpSession;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.exception.BusinessException;

public final class SessionUtil {

    public static final String LOGIN_USER = "LOGIN_USER";

    private SessionUtil() {
    }

    public static AuthUserResponse requireLogin(HttpSession session) {
        Object user = session.getAttribute(LOGIN_USER);
        if (user instanceof AuthUserResponse authUser) {
            return authUser;
        }
        throw new BusinessException(ErrorCode.NOT_LOGIN);
    }

    public static AuthUserResponse requireRole(HttpSession session, String roleType) {
        AuthUserResponse user = requireLogin(session);
        if (!roleType.equals(user.roleType()) && !"admin".equals(user.roleType())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        return user;
    }
}
