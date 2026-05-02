package com.math_paper.util;

import com.fasterxml.jackson.databind.JsonNode;
import org.matheclipse.core.eval.ExprEvaluator;
import org.matheclipse.core.eval.TeXUtilities;
import org.matheclipse.core.interfaces.IExpr;

import java.io.StringWriter;

public final class SymjaCalculateUtil {

    private SymjaCalculateUtil() {
    }

    public static SymjaCalculateResult calculate(JsonNode mathJson) {
        String symjaExpression = MathJsonToSymjaUtil.convertForCalculation(mathJson);
        SymjaCalculateResult result = calculateSymjaExpression(symjaExpression);
        if (MathJsonToSymjaUtil.isIndefiniteIntegral(mathJson)) {
            return appendIntegralConstant(result);
        }

        return result;
    }

    private static SymjaCalculateResult calculateSymjaExpression(String symjaExpression) {
        if (symjaExpression == null || symjaExpression.isBlank()) {
            throw new IllegalArgumentException("Symja 表达式不能为空");
        }

        ExprEvaluator evaluator = new ExprEvaluator();
        IExpr result = evaluator.evaluate(symjaExpression);

        return new SymjaCalculateResult(
                symjaExpression,
                result.toString(),
                toLatex(evaluator, result));
    }

    private static String toLatex(ExprEvaluator evaluator, IExpr expression) {
        StringWriter writer = new StringWriter();
        TeXUtilities texUtilities = new TeXUtilities(evaluator.getEvalEngine(), false);
        boolean success = texUtilities.toTeX(expression, writer);

        if (!success || writer.toString().isBlank()) {
            return expression.toString();
        }

        return normalizeLatex(writer.toString());
    }

    private static String normalizeLatex(String latex) {
        return latex.replace("\\log", "\\ln");
    }

    private static SymjaCalculateResult appendIntegralConstant(SymjaCalculateResult result) {
        return new SymjaCalculateResult(
                result.symjaExpression(),
                result.result() + "+C",
                result.resultLatex() + "+C");
    }

    public record SymjaCalculateResult(
            String symjaExpression,
            String result,
            String resultLatex) {
    }
}
