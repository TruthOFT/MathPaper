package com.math_paper.util;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class MathJsonToSymjaUtil {

    private static final Map<String, String> SYMBOLS = Map.ofEntries(
            Map.entry("ExponentialE", "E"),
            Map.entry("Pi", "Pi"),
            Map.entry("PositiveInfinity", "Infinity"),
            Map.entry("NegativeInfinity", "-Infinity"),
            Map.entry("Infinity", "Infinity"),
            Map.entry("ImaginaryUnit", "I"));

    private static final Map<String, String> DIRECT_FUNCTIONS = Map.ofEntries(
            Map.entry("Sin", "Sin"),
            Map.entry("Cos", "Cos"),
            Map.entry("Tan", "Tan"),
            Map.entry("Cot", "Cot"),
            Map.entry("Sec", "Sec"),
            Map.entry("Csc", "Csc"),
            Map.entry("Arcsin", "ArcSin"),
            Map.entry("Arccos", "ArcCos"),
            Map.entry("Arctan", "ArcTan"),
            Map.entry("ArcSin", "ArcSin"),
            Map.entry("ArcCos", "ArcCos"),
            Map.entry("ArcTan", "ArcTan"),
            Map.entry("Log", "Log"),
            Map.entry("Ln", "Log"),
            Map.entry("Exp", "Exp"),
            Map.entry("Abs", "Abs"),
            Map.entry("Sqrt", "Sqrt"),
            Map.entry("Factorial", "Factorial"),
            Map.entry("RowReduce", "RowReduce"),
            Map.entry("MatrixRank", "MatrixRank"),
            Map.entry("NullSpace", "NullSpace"),
            Map.entry("LinearSolve", "LinearSolve"));

    private MathJsonToSymjaUtil() {
    }

    public static String convert(JsonNode mathJson) {
        if (mathJson == null || mathJson.isNull()) {
            throw new IllegalArgumentException("MathJSON 不能为空");
        }

        return convertNode(mathJson);
    }

    public static String convertForCalculation(JsonNode mathJson) {
        String symjaExpression = convert(mathJson);

        if (hasHead(mathJson, "Equal")) {
            String variable = findFirstVariable(mathJson);
            return call("Solve", List.of(symjaExpression, variable));
        }

        return symjaExpression;
    }

    public static boolean isIndefiniteIntegral(JsonNode mathJson) {
        if (!hasHead(mathJson, "Integrate") || mathJson.size() != 3) {
            return false;
        }

        JsonNode limitsNode = mathJson.get(2);
        return hasHead(limitsNode, "Limits")
                && limitsNode.size() == 4
                && isNothingNode(limitsNode.get(2))
                && isNothingNode(limitsNode.get(3));
    }

    private static String convertNode(JsonNode node) {
        if (node == null || node.isNull()) {
            throw new IllegalArgumentException("MathJSON 节点不能为空");
        }

        if (node.isNumber()) {
            return node.asText();
        }

        if (node.isTextual()) {
            return convertSymbol(node.asText());
        }

        if (node.isObject()) {
            return convertObject(node);
        }

        if (!node.isArray() || node.isEmpty()) {
            throw new IllegalArgumentException("暂不支持的 MathJSON 节点: " + node);
        }

        String head = node.get(0).asText();

        return switch (head) {
            case "Add" -> call("Plus", convertArguments(node, 1));
            case "Subtract" -> convertSubtract(node);
            case "Negate" -> call("Times", List.of("-1", convertRequired(node, 1)));
            case "Multiply" -> convertMultiply(node);
            case "Divide" -> call("Divide", convertArguments(node, 1));
            case "Rational" -> call("Rational", convertArguments(node, 1));
            case "Power" -> call("Power", convertArguments(node, 1));
            case "Root", "Sqrt" -> call("Sqrt", convertArguments(node, 1));
            case "Square" -> call("Power", List.of(convertRequired(node, 1), "2"));
            case "Equal" -> call("Equal", convertArguments(node, 1));
            case "Less" -> call("Less", convertArguments(node, 1));
            case "LessEqual" -> call("LessEqual", convertArguments(node, 1));
            case "Greater" -> call("Greater", convertArguments(node, 1));
            case "GreaterEqual" -> call("GreaterEqual", convertArguments(node, 1));
            case "List" -> "{" + String.join(",", convertArguments(node, 1)) + "}";
            case "Tuple" -> convertTuple(node);
            case "Matrix" -> convertMatrix(node);
            case "Determinant", "Det" -> call("Det", convertArguments(node, 1));
            case "Inverse" -> call("Inverse", convertArguments(node, 1));
            case "Transpose" -> call("Transpose", convertArguments(node, 1));
            case "Subscript" -> convertSubscript(node);
            case "EvaluateAt" -> convertEvaluateAt(node, null);
            case "Delimiter", "Block", "Parentheses" -> convertRequired(node, 1);
            case "Function" -> convertFunctionBody(node);
            case "Limits" -> convertLimits(node);
            case "Integrate" -> convertIntegrate(node);
            case "Derivative", "D" -> convertDerivative(node);
            case "Limit" -> convertLimit(node);
            case "Sum" -> convertIteratorFunction("Sum", node);
            case "Product" -> convertIteratorFunction("Product", node);
            default -> convertKnownFunction(head, node);
        };
    }

    private static String convertObject(JsonNode node) {
        if (node.has("num")) {
            return node.get("num").asText();
        }

        if (node.has("sym")) {
            return convertSymbol(node.get("sym").asText());
        }

        if (node.has("fn")) {
            return convertNode(node.get("fn"));
        }

        throw new IllegalArgumentException("暂不支持的 MathJSON 对象: " + node);
    }

    private static String convertSymbol(String symbol) {
        return SYMBOLS.getOrDefault(symbol, symbol);
    }

    private static boolean hasHead(JsonNode node, String head) {
        return node != null
                && node.isArray()
                && !node.isEmpty()
                && head.equals(node.get(0).asText());
    }

    private static String findFirstVariable(JsonNode node) {
        Set<String> variables = new LinkedHashSet<>();
        collectVariables(node, variables, false);

        if (variables.isEmpty()) {
            throw new IllegalArgumentException("等式中没有可求解变量: " + node);
        }

        return variables.iterator().next();
    }

    private static void collectVariables(JsonNode node, Set<String> variables, boolean isHead) {
        if (node == null || node.isNull()) {
            return;
        }

        if (node.isTextual()) {
            String symbol = node.asText();
            if (!isHead && !SYMBOLS.containsKey(symbol)) {
                variables.add(symbol);
            }
            return;
        }

        if (node.isObject()) {
            if (node.has("sym")) {
                collectVariables(node.get("sym"), variables, false);
            }
            return;
        }

        if (!node.isArray()) {
            return;
        }

        for (int i = 0; i < node.size(); i++) {
            collectVariables(node.get(i), variables, i == 0);
        }
    }

    private static String convertKnownFunction(String head, JsonNode node) {
        String symjaFunction = DIRECT_FUNCTIONS.get(head);
        if (symjaFunction == null) {
            throw new IllegalArgumentException("暂不支持的 MathJSON 函数: " + head);
        }

        return call(symjaFunction, convertArguments(node, 1));
    }

    private static String convertTuple(JsonNode node) {
        if (node.size() >= 3 && node.get(1).isTextual()) {
            String symjaFunction = DIRECT_FUNCTIONS.get(node.get(1).asText());
            if (symjaFunction != null) {
                return call(symjaFunction, convertArguments(node, 2));
            }
        }

        return "{" + String.join(",", convertArguments(node, 1)) + "}";
    }

    private static String convertSubscript(JsonNode node) {
        if (node.size() == 3 && hasHead(node.get(1), "EvaluateAt")) {
            return convertEvaluateAt(node.get(1), node.get(2));
        }

        throw new IllegalArgumentException("Subscript 暂只支持求值竖线: " + node);
    }

    private static String convertEvaluateAt(JsonNode evaluateAtNode, JsonNode substitutionNode) {
        if (evaluateAtNode.size() < 2) {
            throw new IllegalArgumentException("EvaluateAt 缺少表达式: " + evaluateAtNode);
        }

        String expression = convertEvaluateAtExpression(evaluateAtNode.get(1));
        if (substitutionNode == null) {
            return expression;
        }

        return call("ReplaceAll", List.of(expression, convertSubstitutionRule(substitutionNode)));
    }

    private static String convertEvaluateAtExpression(JsonNode node) {
        if (isFunctionNode(node)) {
            return convertFunctionExpression(node);
        }

        return convertNode(node);
    }

    private static String convertSubstitutionRule(JsonNode node) {
        if (hasHead(node, "Equal") || hasHead(node, "Rule") || hasHead(node, "To")) {
            if (node.size() != 3) {
                throw new IllegalArgumentException("代入规则参数数量不支持: " + node);
            }
            return convertNode(node.get(1)) + "->" + convertNode(node.get(2));
        }

        throw new IllegalArgumentException("代入规则格式不支持: " + node);
    }

    private static String convertSubtract(JsonNode node) {
        if (node.size() != 3) {
            throw new IllegalArgumentException("Subtract 需要两个参数: " + node);
        }

        return call("Subtract", List.of(convertNode(node.get(1)), convertNode(node.get(2))));
    }

    private static String convertMultiply(JsonNode node) {
        List<String> args = convertArguments(node, 1);
        if (args.size() >= 2 && allMatrixLikeArguments(node, 1)) {
            return call("Dot", args);
        }

        return call("Times", args);
    }

    private static boolean allMatrixLikeArguments(JsonNode node, int startIndex) {
        for (int i = startIndex; i < node.size(); i++) {
            if (!isMatrixLikeNode(node.get(i))) {
                return false;
            }
        }
        return true;
    }

    private static boolean isMatrixLikeNode(JsonNode node) {
        if (!node.isArray() || node.isEmpty()) {
            return false;
        }

        String head = node.get(0).asText();
        return "Matrix".equals(head) || "List".equals(head) || "Tuple".equals(head);
    }

    private static String convertMatrix(JsonNode node) {
        if (node.size() < 2) {
            throw new IllegalArgumentException("Matrix 缺少行数据: " + node);
        }

        JsonNode rowsNode = node.get(1);
        if (!rowsNode.isArray() || rowsNode.isEmpty() || !"List".equals(rowsNode.get(0).asText())) {
            throw new IllegalArgumentException("Matrix 行数据格式不支持: " + node);
        }

        List<String> rows = new ArrayList<>();
        Integer columnCount = null;
        for (int i = 1; i < rowsNode.size(); i++) {
            JsonNode rowNode = rowsNode.get(i);
            if (!rowNode.isArray() || rowNode.isEmpty()
                    || (!"List".equals(rowNode.get(0).asText()) && !"Tuple".equals(rowNode.get(0).asText()))) {
                throw new IllegalArgumentException("Matrix 行格式不支持: " + rowNode);
            }

            int currentColumnCount = rowNode.size() - 1;
            if (columnCount == null) {
                columnCount = currentColumnCount;
            } else if (columnCount != currentColumnCount) {
                throw new IllegalArgumentException("Matrix 每行列数必须一致: " + node);
            }

            rows.add("{" + String.join(",", convertArguments(rowNode, 1)) + "}");
        }

        return "{" + String.join(",", rows) + "}";
    }

    private static String convertFunctionBody(JsonNode node) {
        if (node.size() < 2) {
            throw new IllegalArgumentException("Function 缺少函数体: " + node);
        }

        return convertNode(node.get(1));
    }

    private static String convertLimits(JsonNode node) {
        if (node.size() == 3) {
            return "{" + convertNode(node.get(1)) + "," + convertNode(node.get(2)) + "}";
        }

        if (node.size() == 4) {
            return "{" + convertNode(node.get(1)) + "," + convertNode(node.get(2)) + "," + convertNode(node.get(3))
                    + "}";
        }

        throw new IllegalArgumentException("Limits 参数数量不支持: " + node);
    }

    private static String convertIntegrate(JsonNode node) {
        if (node.size() == 3) {
            JsonNode integrandNode = node.get(1);
            JsonNode limitsNode = node.get(2);
            String integrand = isFunctionNode(integrandNode)
                    ? convertFunctionExpression(integrandNode)
                    : convertNode(integrandNode);

            if (hasHead(limitsNode, "Limits")) {
                return convertIntegralWithLimits(integrand, integrandNode, limitsNode);
            }

            return call("Integrate", List.of(integrand, convertNode(limitsNode)));
        }

        if (node.size() == 2) {
            return call("Integrate", List.of(convertNode(node.get(1)), guessVariable(node.get(1))));
        }

        throw new IllegalArgumentException("Integrate 参数数量不支持: " + node);
    }

    private static String convertIntegralWithLimits(String integrand, JsonNode integrandNode, JsonNode limitsNode) {
        if (limitsNode.size() != 4) {
            throw new IllegalArgumentException("Integrate Limits 参数数量不支持: " + limitsNode);
        }

        String variable = isNothingNode(limitsNode.get(1))
                ? guessIntegralVariable(integrandNode)
                : convertNode(limitsNode.get(1));
        boolean hasLower = !isNothingNode(limitsNode.get(2));
        boolean hasUpper = !isNothingNode(limitsNode.get(3));

        if (!hasLower && !hasUpper) {
            return call("Integrate", List.of(integrand, variable));
        }

        if (hasLower && hasUpper) {
            String range = "{" + variable + "," + convertNode(limitsNode.get(2)) + "," + convertNode(limitsNode.get(3))
                    + "}";
            return call("Integrate", List.of(integrand, range));
        }

        throw new IllegalArgumentException("Integrate 暂不支持单侧积分上下限: " + limitsNode);
    }

    private static String guessIntegralVariable(JsonNode integrandNode) {
        if (isFunctionNode(integrandNode) && integrandNode.size() >= 3) {
            return convertFunctionVariable(integrandNode);
        }

        return guessVariable(integrandNode);
    }

    private static boolean isNothingNode(JsonNode node) {
        return node != null && node.isTextual() && "Nothing".equals(node.asText());
    }

    private static String convertDerivative(JsonNode node) {
        if (node.size() >= 2 && isFunctionNode(node.get(1))) {
            return convertFunctionDerivative(node);
        }

        if (node.size() == 3) {
            JsonNode arg2 = node.get(2);
            if (!(arg2.isNumber() || (arg2.isTextual() && arg2.asText().matches("\\d+")))) {
                return call("D", List.of(convertNode(node.get(1)), convertNode(arg2)));
            }
        }

        // 格式1: ["D", expr, var] 或 ["Derivative", expr, var]
        if (node.size() == 3) {
            JsonNode arg2 = node.get(2);
            // arg2 是数字 => 阶数，需要从表达式中推断变量
            if (arg2.isNumber() || (arg2.isTextual() && arg2.asText().matches("\\d+"))) {
                int order = arg2.asInt();
                String expr = convertNode(node.get(1));
                String variable = guessVariable(node.get(1));
                if (order == 1) {
                    return call("D", List.of(expr, variable));
                }
                return call("D", List.of(expr, "{" + variable + "," + order + "}"));
            }
            // arg2 是变量符号
            return call("D", List.of(convertNode(node.get(1)), convertNode(arg2)));
        }

        // 格式2: ["D", expr, var, order] 或 ["Derivative", expr, var, order]
        if (node.size() == 4) {
            String variableAndOrder = "{" + convertNode(node.get(2)) + "," + convertNode(node.get(3)) + "}";
            return call("D", List.of(convertNode(node.get(1)), variableAndOrder));
        }

        // 格式3: ["Derivative", expr] => 一阶导，推断变量
        if (node.size() == 2) {
            String expr = convertNode(node.get(1));
            String variable = guessVariable(node.get(1));
            return call("D", List.of(expr, variable));
        }

        throw new IllegalArgumentException("Derivative 参数数量不支持: " + node);
    }

    private static String convertFunctionDerivative(JsonNode node) {
        JsonNode functionNode = node.get(1);
        String expression = convertFunctionExpression(functionNode);
        String variable = convertFunctionDerivativeVariable(functionNode);

        if (node.size() == 2) {
            return call("D", List.of(expression, variable));
        }

        if (node.size() == 3) {
            JsonNode arg2 = node.get(2);
            if (arg2.isNumber() || (arg2.isTextual() && arg2.asText().matches("\\d+"))) {
                int order = arg2.asInt();
                if (order == 1) {
                    return call("D", List.of(expression, variable));
                }
                return call("D", List.of(expression, "{" + variable + "," + order + "}"));
            }

            return call("D", List.of(expression, convertNode(arg2)));
        }

        if (node.size() == 4) {
            String variableAndOrder = "{" + convertNode(node.get(2)) + "," + convertNode(node.get(3)) + "}";
            return call("D", List.of(expression, variableAndOrder));
        }

        throw new IllegalArgumentException("Derivative 鍙傛暟鏁伴噺涓嶆敮鎸? " + node);
    }

    /**
     * 从表达式节点中猜测第一个出现的变量（非常量符号）作为求导变量。
     * 如果找不到，默认返回 "x"。
     */
    private static String guessVariable(JsonNode exprNode) {
        Set<String> vars = new LinkedHashSet<>();
        collectVariables(exprNode, vars, false);
        if (vars.contains("x")) {
            return "x";
        }
        return vars.isEmpty() ? "x" : vars.iterator().next();
    }

    private static String convertLimit(JsonNode node) {
        if (node.size() == 3 && isFunctionNode(node.get(1))) {
            String expression = convertFunctionExpression(node.get(1));
            String variable = convertFunctionVariable(node.get(1));
            String rule = variable + "->" + convertNode(node.get(2));
            return call("Limit", List.of(expression, rule));
        }

        if (node.size() == 4) {
            String rule = convertNode(node.get(2)) + "->" + convertNode(node.get(3));
            return call("Limit", List.of(convertNode(node.get(1)), rule));
        }

        throw new IllegalArgumentException("Limit 参数数量不支持: " + node);
    }

    private static boolean isFunctionNode(JsonNode node) {
        return node != null
                && node.isArray()
                && node.size() >= 3
                && "Function".equals(node.get(0).asText());
    }

    private static String convertFunctionExpression(JsonNode functionNode) {
        return convertNode(functionNode.get(1));
    }

    private static String convertFunctionVariable(JsonNode functionNode) {
        return convertNode(functionNode.get(2));
    }

    private static String convertFunctionDerivativeVariable(JsonNode functionNode) {
        if (functionNode.size() < 3) {
            return "x";
        }

        return convertNode(functionNode.get(functionNode.size() - 1));
    }

    private static String convertIteratorFunction(String symjaFunction, JsonNode node) {
        if (node.size() == 3) {
            JsonNode iteratorNode = node.get(2);
            if (hasHead(iteratorNode, "Limits")) {
                return call(symjaFunction, List.of(convertNode(node.get(1)), convertIteratorLimits(iteratorNode)));
            }

            return call(symjaFunction, List.of(convertNode(node.get(1)), convertNode(iteratorNode)));
        }

        throw new IllegalArgumentException(symjaFunction + " 参数数量不支持: " + node);
    }

    private static String convertIteratorLimits(JsonNode node) {
        if (node.size() == 4) {
            return "{" + convertNode(node.get(1)) + "," + convertNode(node.get(2)) + "," + convertNode(node.get(3))
                    + "}";
        }

        throw new IllegalArgumentException("迭代上下限参数数量不支持: " + node);
    }

    private static String convertRequired(JsonNode node, int index) {
        if (node.size() <= index) {
            throw new IllegalArgumentException("MathJSON 缺少第 " + index + " 个参数: " + node);
        }

        return convertNode(node.get(index));
    }

    private static List<String> convertArguments(JsonNode node, int startIndex) {
        List<String> args = new ArrayList<>();
        for (int i = startIndex; i < node.size(); i++) {
            args.add(convertNode(node.get(i)));
        }
        return args;
    }

    private static String call(String function, List<String> args) {
        return function + "[" + String.join(",", args) + "]";
    }
}
