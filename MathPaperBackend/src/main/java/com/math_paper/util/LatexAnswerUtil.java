package com.math_paper.util;

public final class LatexAnswerUtil {

    private LatexAnswerUtil() {
    }

    public static String normalize(String latex) {
        if (latex == null) {
            return "";
        }

        return latex.trim()
                .replaceAll("^\\\\\\(", "")
                .replaceAll("\\\\\\)$", "")
                .replaceAll("^\\$\\$\\s*", "")
                .replaceAll("\\s*\\$\\$$", "")
                .replace("\\dfrac", "\\frac")
                .replace("\\tfrac", "\\frac")
                .replace("\\left", "")
                .replace("\\right", "")
                .replace("\\,", "")
                .replace("\\;", "")
                .replace("\\:", "")
                .replace("\\!", "")
                .replaceAll("\\s+", "");
    }

    public static String display(String answerValue) {
        String normalized = normalize(answerValue);
        return normalized.isBlank() ? "" : "\\(" + normalized + "\\)";
    }
}
