package com.math_paper.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class LatexAnswerUtil {

    private static final Pattern BRACED_FRAC = Pattern.compile("\\\\frac\\{([^{}]+)}\\{([^{}]+)}");
    private static final Pattern SHORT_FRAC = Pattern.compile("\\\\frac([A-Za-z0-9])([A-Za-z0-9])");
    private static final Pattern DECIMAL_WITH_LEADING_DOT = Pattern.compile("(?<![A-Za-z0-9])\\.([0-9]+)");
    private static final Pattern DECIMAL_TRAILING_ZERO = Pattern.compile("(?<![A-Za-z])([0-9]+)\\.0+(?![0-9])");
    private static final Pattern DECIMAL_TRAILING_ZEROES = Pattern.compile("(?<![A-Za-z])([0-9]+\\.[0-9]*?)0+(?![0-9])");
    private static final Pattern FUNCTION_WITH_PARENS = Pattern.compile("(sin|cos|tan|cot|sec|csc|ln|log)\\(([^()]+)\\)");
    private static final Pattern FUNCTION_WITH_BRACES = Pattern.compile("(sin|cos|tan|cot|sec|csc|ln|log)\\{([^{}]+)}");
    private static final Pattern SINGLE_VALUE_PARENS = Pattern.compile("\\(([A-Za-z0-9]+)\\)");
    private static final Pattern SINGLE_VALUE_BRACES = Pattern.compile("\\{([A-Za-z0-9]+)}");

    private LatexAnswerUtil() {
    }

    public static String normalize(String latex) {
        if (latex == null) {
            return "";
        }

        String normalized = latex.trim()
                .replaceAll("^\\\\\\(", "")
                .replaceAll("\\\\\\)$", "")
                .replaceAll("^\\$\\$\\s*", "")
                .replaceAll("\\s*\\$\\$$", "")
                .replace("−", "-")
                .replace("–", "-")
                .replace("\\dfrac", "\\frac")
                .replace("\\tfrac", "\\frac")
                .replace("\\left", "")
                .replace("\\right", "")
                .replace("\\cdot", "*")
                .replace("\\times", "*")
                .replace("×", "*")
                .replace("·", "*")
                .replace("÷", "/")
                .replace("\\,", "")
                .replace("\\;", "")
                .replace("\\:", "")
                .replace("\\!", "")
                .replaceAll("\\^\\{([^{}]+)}", "^$1")
                .replaceAll("\\s+", "");
        normalized = normalizeDecimals(normalized);
        normalized = normalizeFractions(normalized);
        normalized = normalized
                .replace("\\sin", "sin")
                .replace("\\cos", "cos")
                .replace("\\tan", "tan")
                .replace("\\cot", "cot")
                .replace("\\sec", "sec")
                .replace("\\csc", "csc")
                .replace("\\ln", "ln")
                .replace("\\log", "log");
        normalized = replaceRepeatedly(normalized, FUNCTION_WITH_PARENS, "$1$2");
        normalized = replaceRepeatedly(normalized, FUNCTION_WITH_BRACES, "$1$2");
        normalized = replaceRepeatedly(normalized, SINGLE_VALUE_PARENS, "$1");
        normalized = replaceRepeatedly(normalized, SINGLE_VALUE_BRACES, "$1");
        return normalized.replace("{", "").replace("}", "");
    }

    public static String display(String answerValue) {
        String normalized = normalize(answerValue);
        return normalized.isBlank() ? "" : "\\(" + normalized + "\\)";
    }

    private static String normalizeFractions(String value) {
        String normalized = replaceRepeatedly(value, BRACED_FRAC, "frac($1,$2)");
        return replaceRepeatedly(normalized, SHORT_FRAC, "frac($1,$2)");
    }

    private static String normalizeDecimals(String value) {
        String normalized = replaceRepeatedly(value, DECIMAL_WITH_LEADING_DOT, "0.$1");
        normalized = replaceRepeatedly(normalized, DECIMAL_TRAILING_ZERO, "$1");
        return replaceRepeatedly(normalized, DECIMAL_TRAILING_ZEROES, "$1");
    }

    private static String replaceRepeatedly(String value, Pattern pattern, String replacement) {
        String current = value;
        while (true) {
            Matcher matcher = pattern.matcher(current);
            String next = matcher.replaceAll(replacement);
            if (next.equals(current)) {
                return next;
            }
            current = next;
        }
    }
}
