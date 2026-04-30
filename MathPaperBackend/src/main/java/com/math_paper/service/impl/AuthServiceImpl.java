package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AuthRequest;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.entity.UserAccount;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.UserAccountMapper;
import com.math_paper.service.AuthService;
import com.math_paper.util.PasswordUtil;
import com.math_paper.util.SessionUtil;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserAccountMapper userAccountMapper;

    @Override
    public AuthUserResponse register(AuthRequest request, HttpSession session) {
        validateAccount(request);

        Long count = userAccountMapper.selectCount(new LambdaQueryWrapper<UserAccount>()
                .eq(UserAccount::getUsername, request.username())
                .eq(UserAccount::getIsDelete, 0));
        if (count > 0) {
            throw new BusinessException(ErrorCode.ACCOUNT_EXISTS);
        }

        UserAccount user = new UserAccount();
        user.setUsername(request.username().trim());
        user.setPasswordHash(PasswordUtil.md5WithSalt(request.password()));
        user.setRoleType(defaultRole(request.roleType()));
        user.setRealName(isBlank(request.realName()) ? request.username().trim() : request.realName().trim());
        user.setStatus(1);
        user.setIsDelete(0);
        userAccountMapper.insert(user);

        AuthUserResponse response = toResponse(user);
        session.setAttribute(SessionUtil.LOGIN_USER, response);
        return response;
    }

    @Override
    public AuthUserResponse login(AuthRequest request, HttpSession session) {
        if (isBlank(request.username()) || isBlank(request.password())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "账号和密码不能为空");
        }

        UserAccount user = userAccountMapper.selectOne(new LambdaQueryWrapper<UserAccount>()
                .eq(UserAccount::getUsername, request.username().trim())
                .eq(UserAccount::getIsDelete, 0)
                .last("limit 1"));
        if (user == null || user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ACCOUNT_PASSWORD_ERROR);
        }

        String hash = PasswordUtil.md5WithSalt(request.password());
        if (!hash.equals(user.getPasswordHash())) {
            if (isDemoPassword(user, request.password())) {
                user.setPasswordHash(hash);
                userAccountMapper.updateById(user);
            } else {
                throw new BusinessException(ErrorCode.ACCOUNT_PASSWORD_ERROR);
            }
        }

        AuthUserResponse response = toResponse(user);
        session.setAttribute(SessionUtil.LOGIN_USER, response);
        return response;
    }

    @Override
    public AuthUserResponse me(HttpSession session) {
        return SessionUtil.requireLogin(session);
    }

    @Override
    public void logout(HttpSession session) {
        session.invalidate();
    }

    private boolean isDemoPassword(UserAccount user, String rawPassword) {
        return "123456".equals(rawPassword) && user.getPasswordHash() != null && user.getPasswordHash().startsWith("$2a$10$demo.");
    }

    private void validateAccount(AuthRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.password())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "账号和密码不能为空");
        }
        if (request.password().length() < 6) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "密码至少 6 位");
        }
    }

    private AuthUserResponse toResponse(UserAccount user) {
        return new AuthUserResponse(user.getId(), user.getUsername(), user.getRoleType(), user.getRealName());
    }

    private String defaultRole(String roleType) {
        if ("teacher".equals(roleType) || "student".equals(roleType) || "admin".equals(roleType)) {
            return roleType;
        }
        return "student";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
