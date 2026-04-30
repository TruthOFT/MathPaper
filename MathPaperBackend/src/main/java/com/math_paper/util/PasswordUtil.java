package com.math_paper.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class PasswordUtil {

    private static final String PASSWORD_SALT = "MathPaper@2026#SmartHomework";

    private PasswordUtil() {
    }

    public static String md5WithSalt(String rawPassword) {
        return md5WithSalt(rawPassword, PASSWORD_SALT);
    }

    private static String md5WithSalt(String rawPassword, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] bytes = digest.digest((rawPassword + salt).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("MD5 算法不可用", exception);
        }
    }
}
