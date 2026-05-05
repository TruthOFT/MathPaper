package com.math_paper;

import org.junit.jupiter.api.Test;
import org.matheclipse.core.eval.ExprEvaluator;
import org.matheclipse.core.interfaces.IExpr;
import org.springframework.boot.test.context.SpringBootTest;

import static com.math_paper.util.LatexToSymjaUtil.tryConvert;

@SpringBootTest
class MathPaperBackendApplicationTests {

    public static boolean areEquivalent(String latex1, String latex2) {
        String symja1 = tryConvert(latex1);
        String symja2 = tryConvert(latex2);
        if (symja1 == null || symja2 == null) {
            return false;
        }
        ExprEvaluator evaluator = new ExprEvaluator();
        String checkExpr = "Simplify[" + symja1 + "-(" + symja2 + ")]";
        IExpr result = evaluator.evaluate(checkExpr);
        return "0".equals(result.toString());
    }
    @Test
    void contextLoads() {
        boolean a = areEquivalent("\\(e^x(\\sin x+\\cos x)\\)", "e^{x}\\sin\\left(x\\right)+e^{x}\\cos\\left(x\\right)");
        System.out.println(a);
    }

}
