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
            Map.entry("ImaginaryUnit", "I")
    );

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
            Map.entry("Factorial", "Factorial")
    );

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
            case "Multiply" -> call("Times", convertArguments(node, 1));
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
            case "List", "Tuple" -> "{" + String.join(",", convertArguments(node, 1)) + "}";
            case "Delimiter", "Block", "Parentheses" -> convertRequired(node, 1);
            case "Function" -> convertFunctionBody(node);
            case "Limits" -> convertLimits(node);
            case "Integrate" -> convertIntegrate(node);
            case "Derivative" -> convertDerivative(node);
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

    private static String convertSubtract(JsonNode node) {
        if (node.size() != 3) {
            throw new IllegalArgumentException("Subtract 需要两个参数: " + node);
        }

        return call("Subtract", List.of(convertNode(node.get(1)), convertNode(node.get(2))));
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
            return "{" + convertNode(node.get(1)) + "," + convertNode(node.get(2)) + "," + convertNode(node.get(3)) + "}";
        }

        throw new IllegalArgumentException("Limits 参数数量不支持: " + node);
    }

    private static String convertIntegrate(JsonNode node) {
        if (node.size() == 3) {
            return call("Integrate", List.of(convertNode(node.get(1)), convertNode(node.get(2))));
        }

        throw new IllegalArgumentException("Integrate 参数数量不支持: " + node);
    }

    private static String convertDerivative(JsonNode node) {
        if (node.size() == 3) {
            return call("D", List.of(convertNode(node.get(1)), convertNode(node.get(2))));
        }

        if (node.size() == 4) {
            String variableAndOrder = "{" + convertNode(node.get(2)) + "," + convertNode(node.get(3)) + "}";
            return call("D", List.of(convertNode(node.get(1)), variableAndOrder));
        }

        throw new IllegalArgumentException("Derivative 参数数量不支持: " + node);
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

    private static String convertIteratorFunction(String symjaFunction, JsonNode node) {
        if (node.size() == 3) {
            return call(symjaFunction, List.of(convertNode(node.get(1)), convertNode(node.get(2))));
        }

        throw new IllegalArgumentException(symjaFunction + " 参数数量不支持: " + node);
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
