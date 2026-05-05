package com.math_paper.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 将 LaTeX 数学表达式转换为 Symja (matheclipse) 表达式，用于符号等价判题。
 *
 * <p>转换规则（按顺序执行）：
 * <ol>
 *   <li>去除 \\( \\) $$ $$ 定界符</li>
 *   <li>\\frac{a}{b} → (a)/(b)</li>
 *   <li>\\sqrt{a} → Sqrt[a]</li>
 *   <li>\\sin → Sin, \\cos → Cos 等函数名</li>
 *   <li>函数参数加中括号：Sin x → Sin[x]</li>
 *   <li>隐式乘法补 *</li>
 *   <li>e → E (自然常数)</li>
 *   <li>\\pi → Pi</li>
 * </ol>
 */
public final class LatexToSymjaUtil {

    private LatexToSymjaUtil() {
    }

    // \frac{num}{den}
    private static final Pattern FRAC = Pattern.compile("\\\\frac\\{([^{}]*(?:\\{[^{}]*}[^{}]*)*)\\}\\{([^{}]*(?:\\{[^{}]*}[^{}]*)*)}");

    // \sqrt{expr} or \sqrt[n]{expr}
    private static final Pattern SQRT = Pattern.compile("\\\\sqrt(?:\\[([^]]*)])?\\{([^{}]*(?:\\{[^{}]*}[^{}]*)*)}");

    // LaTeX function names → Symja
    private static final java.util.Map<String, String> FUNC_MAP = java.util.Map.ofEntries(
            java.util.Map.entry("\\sin", "Sin"),
            java.util.Map.entry("\\cos", "Cos"),
            java.util.Map.entry("\\tan", "Tan"),
            java.util.Map.entry("\\cot", "Cot"),
            java.util.Map.entry("\\sec", "Sec"),
            java.util.Map.entry("\\csc", "Csc"),
            java.util.Map.entry("\\arcsin", "ArcSin"),
            java.util.Map.entry("\\arccos", "ArcCos"),
            java.util.Map.entry("\\arctan", "ArcTan"),
            java.util.Map.entry("\\ln", "Log"),
            java.util.Map.entry("\\log", "Log"),
            java.util.Map.entry("\\exp", "Exp"),
            java.util.Map.entry("\\abs", "Abs")
    );

    private static final String[] PLAIN_FUNCTIONS = {
            "arcsin", "arccos", "arctan",
            "sin", "cos", "tan", "cot", "sec", "csc",
            "sqrt", "ln", "log", "exp", "abs"
    };

    private static final java.util.Map<String, String> PLAIN_FUNC_MAP = java.util.Map.ofEntries(
            java.util.Map.entry("sin", "Sin"),
            java.util.Map.entry("cos", "Cos"),
            java.util.Map.entry("tan", "Tan"),
            java.util.Map.entry("cot", "Cot"),
            java.util.Map.entry("sec", "Sec"),
            java.util.Map.entry("csc", "Csc"),
            java.util.Map.entry("arcsin", "ArcSin"),
            java.util.Map.entry("arccos", "ArcCos"),
            java.util.Map.entry("arctan", "ArcTan"),
            java.util.Map.entry("sqrt", "Sqrt"),
            java.util.Map.entry("ln", "Log"),
            java.util.Map.entry("log", "Log"),
            java.util.Map.entry("exp", "Exp"),
            java.util.Map.entry("abs", "Abs")
    );

    // 函数调用模式: Func[...] 后面跟的可能是字母、数字、( 或 {
    // 用于给函数参数加中括号
    private static final Pattern FUNC_CALL = Pattern.compile(
            "(Sin|Cos|Tan|Cot|Sec|Csc|ArcSin|ArcCos|ArcTan|Log|Exp|Abs|Sqrt)" +
            "(\\^\\{[^}]*})?" +   // 可选上标如 Sin^2
            "\\s*" +
            "([a-zA-Z0-9(]|\\[[^]]*])");  // 参数起始字符

    /**
     * 尝试将 LaTeX 答案转换为 Symja 表达式。转换失败返回 null。
     */
    public static String tryConvert(String latex) {
        if (latex == null || latex.isBlank()) {
            return null;
        }
        try {
            return convert(latex);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 判断两个 LaTeX 表达式是否数学等价（通过 Symja Simplify[expr1 - expr2] == 0）。
     */
    public static boolean areEquivalent(String latex1, String latex2) {
        String symja1 = tryConvert(latex1);
        String symja2 = tryConvert(latex2);
        if (symja1 == null || symja2 == null) {
            return false;
        }

        try {
            org.matheclipse.core.eval.ExprEvaluator evaluator = new org.matheclipse.core.eval.ExprEvaluator();
            String checkExpr = "Simplify[" + symja1 + "-(" + symja2 + ")]";
            org.matheclipse.core.interfaces.IExpr result = evaluator.evaluate(checkExpr);
            return "0".equals(result.toString());
        } catch (Exception e) {
            return false;
        }
    }

    static String convert(String latex) {
        String expr = latex.trim();

        // 1. 去除 LaTeX 定界符
        expr = expr.replaceAll("^\\\\\\(\\s*", "")
                   .replaceAll("\\s*\\\\\\)$", "")
                   .replaceAll("^\\$\\$\\s*", "")
                   .replaceAll("\\s*\\$\\$$", "")
                   .trim();

        // 2. 去除无意义命令
        expr = expr.replace("\\left", "")
                   .replace("\\right", "")
                   .replace("\\,", "")
                   .replace("\\;", "")
                   .replace("\\:", "")
                   .replace("\\!", "")
                   .replace("\\displaystyle", "")
                   .replace("\\textstyle", "");

        // 3. 运算符替换（在转换 frac/sqrt 之前做，因为它们的参数里也可能含运算符）
        expr = expr.replace("\\cdot", "*")
                   .replace("\\times", "*")
                   .replace("∗", "*")
                   .replace("×", "*")
                   .replace("·", "*")
                   .replace("÷", "/")
                   .replace("−", "-")
                   .replace("–", "-");

        // 4. \\frac{num}{den} → (num)/(den) —— 递归处理嵌套
        expr = replaceFrac(expr);

        // 5. \\sqrt{expr} → Sqrt[expr], \\sqrt[n]{expr} → expr^(1/n)
        expr = replaceSqrt(expr);

        // 6. 函数名替换 \\sin → Sin 等
        for (var entry : FUNC_MAP.entrySet()) {
            expr = expr.replace(entry.getKey(), entry.getValue());
        }
        expr = replacePlainFunctionNames(expr);

        // 7. \\pi → Pi
        expr = expr.replace("\\pi", "Pi");

        // 8. 处理函数参数：Sin expr → Sin[expr]
        //    策略：在每个函数名后，找到其参数并包上 []
        expr = wrapFunctionArgs(expr);

        // 9. 处理幂次上标：a^{b} → a^b (保留花括号内容)
        expr = expr.replaceAll("\\^\\{([^}]*)}", "^($1)");

        // 10. 去除剩余空格和花括号
        expr = expr.replace(" ", "");
        expr = expr.replace("{", "").replace("}", "");

        // 11. 补全隐式乘法
        expr = insertImplicitMultiply(expr);

        // 12. e → E (自然常数)：独立的 e 或 e^ 或 (e 或 *e
        expr = replaceEulerE(expr);

        if (expr.isBlank()) {
            return null;
        }
        return expr;
    }

    /**
     * 递归替换 \\frac
     */
    private static String replaceFrac(String expr) {
        // 手动解析嵌套花括号
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < expr.length()) {
            if (i + 5 < expr.length() && expr.startsWith("\\frac", i)) {
                int j = i + 5;
                if (j < expr.length() && expr.charAt(j) == '{') {
                    String num = extractBraced(expr, j);
                    int afterNum = j + num.length() + 2; // skip {num}
                    if (afterNum < expr.length() && expr.charAt(afterNum) == '{') {
                        String den = extractBraced(expr, afterNum);
                        sb.append("(").append(replaceFrac(num)).append(")/(").append(replaceFrac(den)).append(")");
                        i = afterNum + den.length() + 2;
                        continue;
                    }
                }
            }
            sb.append(expr.charAt(i));
            i++;
        }
        return sb.toString();
    }

    /**
     * 从 expr[pos]='{' 开始提取花括号内容（处理嵌套）
     */
    private static String extractBraced(String expr, int pos) {
        if (pos >= expr.length() || expr.charAt(pos) != '{') {
            return "";
        }
        int depth = 0;
        int start = pos;
        for (int i = pos; i < expr.length(); i++) {
            char c = expr.charAt(i);
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return expr.substring(start + 1, i);
                }
            }
        }
        return expr.substring(start + 1);
    }

    /**
     * \\sqrt{expr} → Sqrt[expr], \\sqrt[n]{expr} → (expr)^(1/n)
     */
    private static String replaceSqrt(String expr) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < expr.length()) {
            if (i + 5 < expr.length() && expr.startsWith("\\sqrt", i)) {
                int j = i + 5;
                String n = null;
                if (j < expr.length() && expr.charAt(j) == '[') {
                    int closeBracket = expr.indexOf(']', j);
                    if (closeBracket > j) {
                        n = expr.substring(j + 1, closeBracket);
                        j = closeBracket + 1;
                    }
                }
                if (j < expr.length() && expr.charAt(j) == '{') {
                    String inner = extractBraced(expr, j);
                    if (n != null) {
                        sb.append("((").append(replaceSqrt(inner)).append(")^(1/(").append(n).append(")))");
                    } else {
                        sb.append("Sqrt[").append(replaceSqrt(inner)).append("]");
                    }
                    i = j + inner.length() + 2;
                    continue;
                }
            }
            sb.append(expr.charAt(i));
            i++;
        }
        return sb.toString();
    }

    /**
     * 给函数名后的参数加上中括号。
     * 例如: Sinx → Sin[x], Cos2x → Cos[2*x], Sin(x+1) → Sin[x+1], Exp(x) → Exp[x]
     * 注意：需要在补隐式乘法之前调用（因为 Sinx 会被误判为隐式乘法）
     */
    private static String wrapFunctionArgs(String expr) {
        // 函数名模式
        Pattern funcPattern = Pattern.compile(
                "(Sin|Cos|Tan|Cot|Sec|Csc|ArcSin|ArcCos|ArcTan|Log|Exp|Abs|Sqrt)" +
                "(\\^\\{[^}]*})?");  // 可选上标

        StringBuilder result = new StringBuilder();
        Matcher m = funcPattern.matcher(expr);
        int lastEnd = 0;
        while (m.find()) {
            result.append(expr, lastEnd, m.start());
            String funcName = m.group(1);
            String superscript = m.group(2); // may be null

            int argStart = m.end();
            int valueStart = argStart;
            while (valueStart < expr.length() && Character.isWhitespace(expr.charAt(valueStart))) {
                valueStart++;
            }
            if (valueStart >= expr.length()) {
                // 函数在末尾，没有参数
                result.append(m.group());
                lastEnd = argStart;
                continue;
            }

            String arg;
            int argEnd;
            char firstChar = expr.charAt(valueStart);

            if (firstChar == '(' || firstChar == '[') {
                // 已经有括号：Sin(x+1) → Sin[x+1]
                char open = firstChar;
                char close = (open == '(') ? ')' : ']';
                int depth = 1;
                int k = valueStart + 1;
                while (k < expr.length() && depth > 0) {
                    char c = expr.charAt(k);
                    if (c == open) depth++;
                    else if (c == close) depth--;
                    k++;
                }
                arg = expr.substring(valueStart + 1, k - 1);
                argEnd = k;
            } else if (firstChar == '{') {
                // Sin{x} → Sin[x]
                arg = extractBraced(expr, valueStart);
                argEnd = valueStart + arg.length() + 2;
            } else if (Character.isLetter(firstChar)) {
                // Sinx → Sin[x] (单字母变量)
                int k = valueStart;
                while (k < expr.length() && (Character.isLetterOrDigit(expr.charAt(k)) || expr.charAt(k) == '_')) {
                    k++;
                }
                arg = expr.substring(valueStart, k);
                argEnd = k;
            } else if (Character.isDigit(firstChar)) {
                // Sin2 → Sin[2]
                int k = valueStart;
                while (k < expr.length() && (Character.isDigit(expr.charAt(k)) || expr.charAt(k) == '.')) {
                    k++;
                }
                arg = expr.substring(valueStart, k);
                argEnd = k;
            } else {
                // 无法识别的参数起始
                result.append(m.group());
                lastEnd = argStart;
                continue;
            }

            String wrappedArg = wrapFunctionArgs(arg); // 递归处理嵌套函数

            if (superscript != null) {
                // Sin^2[x] → Sin[x]^2
                result.append(funcName).append("[").append(wrappedArg).append("]").append(superscript);
            } else {
                result.append(funcName).append("[").append(wrappedArg).append("]");
            }
            lastEnd = argEnd;
        }
        result.append(expr.substring(lastEnd));
        return result.toString();
    }

    /**
     * 在需要的位置插入显式乘号 *
     */
    private static String insertImplicitMultiply(String expr) {
        if (expr.isEmpty()) return expr;

        expr = expr.replaceAll("([A-Za-z0-9\\]\\)])(?=(Sin|Cos|Tan|Cot|Sec|Csc|ArcSin|ArcCos|ArcTan|Log|Exp|Abs|Sqrt)\\[)", "$1*");

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < expr.length(); i++) {
            char c = expr.charAt(i);
            sb.append(c);

            if (i + 1 < expr.length()) {
                char next = expr.charAt(i + 1);

                // 数字后跟字母或左括号: 2x → 2*x, 2(x → 2*(x
                if (Character.isDigit(c) && (Character.isLetter(next) || next == '(')) {
                    sb.append('*');
                }
                // 右括号或右方括号后跟字母、数字、左括号或函数名: )x → )*x, ]( → ]*(
                else if ((c == ')' || c == ']') &&
                         (Character.isLetterOrDigit(next) || next == '(' || next == '[')) {
                    sb.append('*');
                }
                // 字母/数字后跟左括号: x( → x*(, 2( → 2*(
                else if ((Character.isLetterOrDigit(c)) && next == '(') {
                    sb.append('*');
                }
                // 字母后跟字母: xy → x*y (变量间隐式乘)
                // 但要排除函数名中的字母组合 (已在上一步处理)
            }
        }
        return sb.toString();
    }

    private static String replacePlainFunctionNames(String expr) {
        StringBuilder result = new StringBuilder();
        int i = 0;
        while (i < expr.length()) {
            String matched = null;
            for (String function : PLAIN_FUNCTIONS) {
                if (expr.regionMatches(i, function, 0, function.length())) {
                    matched = function;
                    break;
                }
            }
            if (matched != null) {
                result.append(PLAIN_FUNC_MAP.get(matched));
                i += matched.length();
            } else {
                result.append(expr.charAt(i));
                i++;
            }
        }
        return result.toString();
    }

    /**
     * 将自然常数 e 转换为 E。
     * 规则：独立的 e、e^、)e、(e、*e、开头 e^
     */
    private static String replaceEulerE(String expr) {
        // e 后面跟 ^ → E^
        expr = expr.replaceAll("(?<![a-zA-Z])e\\^", "E^");
        // 独立的 e（整个表达式只有一个 e）
        if (expr.equals("e")) {
            return "E";
        }
        // (*e 或 (+e 或 (-e 等
        expr = expr.replaceAll("([(*+\\-])e(?![a-zA-Z])", "$1E");
        // e) 或 e* 或 e+ 或 e- 或 e$
        expr = expr.replaceAll("(?<![a-zA-Z])e([)*+\\-]|$)", "E$1");
        return expr;
    }
}
