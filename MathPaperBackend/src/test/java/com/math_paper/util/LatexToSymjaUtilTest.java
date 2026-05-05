package com.math_paper.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LatexToSymjaUtilTest {

    @Test
    void convertsPlainTrigAndBracedEulerProduct() {
        assertEquals(
                "E^(x)*Sin[x]+E^(x)*Cos[x]",
                LatexToSymjaUtil.convert("e^{x}sinx+e^{x}cosx"));
    }

    @Test
    void convertsAsteriskOperator() {
        assertEquals(
                "E^x*Sin[x]+E^x*Cos[x]",
                LatexToSymjaUtil.convert("e^x sinx+e^x\u2217cosx"));
    }

    @Test
    void judgesFactoredAndExpandedAnswersEquivalent() {
        assertTrue(LatexToSymjaUtil.areEquivalent(
                "e^x sinx+e^x\u2217cosx",
                "e^x(sinx+cosx)"));
    }

    @Test
    void judgesBracedEulerExpandedStandardEquivalentToFactoredAnswer() {
        assertTrue(LatexToSymjaUtil.areEquivalent(
                "e^{x}(sinx+cosx)",
                "e^{x}sinx+e^{x}cosx"));
    }

    @Test
    void judgesLatexTrigWithSpaceEquivalentToExpandedAnswer() {
        assertTrue(LatexToSymjaUtil.areEquivalent(
                "\\(e^x(\\sin x+\\cos x)\\)",
                "e^{x}sinx+e^{x}cosx"));
    }

    @Test
    void keepsLatexTrigFunctionNamesAsSymjaFunctions() {
        assertEquals("Sin[x]+Cos[x]", LatexToSymjaUtil.convert("\\sin{x}+\\cos{x}"));
    }
}
