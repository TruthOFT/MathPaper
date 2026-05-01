package com.math_paper.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LatexAnswerUtilTest {

    @Test
    void normalizeEquivalentFractions() {
        assertEquals(LatexAnswerUtil.normalize("\\frac{1}{3}"), LatexAnswerUtil.normalize("\\frac13"));
    }

    @Test
    void normalizeEquivalentTrigonometricAnswers() {
        assertEquals(LatexAnswerUtil.normalize("−sinx"), LatexAnswerUtil.normalize("−sin(x)"));
        assertEquals(LatexAnswerUtil.normalize("-\\sin{x}"), LatexAnswerUtil.normalize("-\\sin(x)"));
    }

    @Test
    void normalizeEquivalentPowers() {
        assertEquals(LatexAnswerUtil.normalize("x^2"), LatexAnswerUtil.normalize("x^{2}"));
        assertEquals(LatexAnswerUtil.normalize("(x)^2"), LatexAnswerUtil.normalize("x^2"));
    }

    @Test
    void normalizeEquivalentMultiplicationSigns() {
        assertEquals(LatexAnswerUtil.normalize("2*x"), LatexAnswerUtil.normalize("2\\cdot x"));
        assertEquals(LatexAnswerUtil.normalize("2*x"), LatexAnswerUtil.normalize("2×x"));
    }

    @Test
    void normalizeEquivalentDecimals() {
        assertEquals(LatexAnswerUtil.normalize("1"), LatexAnswerUtil.normalize("1.0"));
        assertEquals(LatexAnswerUtil.normalize("0.5"), LatexAnswerUtil.normalize(".5000"));
    }
}
