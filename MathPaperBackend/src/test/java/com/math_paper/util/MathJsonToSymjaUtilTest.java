package com.math_paper.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MathJsonToSymjaUtilTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void derivativeFunctionUsesLastFunctionVariable() throws Exception {
        assertEquals(
                "D[Power[a,x],x]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Derivative",["Function",["Block",["Power","a","x"]],"a","x"]]
                        """)));
    }

    @Test
    void derivativeWithoutVariablePrefersXWhenPresent() throws Exception {
        assertEquals(
                "D[Power[a,x],x]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Derivative",["Power","a","x"]]
                        """)));
    }

    @Test
    void derivativeExplicitVariableIsRespected() throws Exception {
        assertEquals(
                "D[Power[a,x],x]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Derivative",["Power","a","x"],"x"]
                        """)));
    }

    @Test
    void derivativeNaturalLogDisplaysAsLn() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Derivative",["Function",["Block",["Power","a","x"]],"a","x"]]
                """));

        assertEquals("D[Power[a,x],x]", result.symjaExpression());
        assertTrue(result.resultLatex().contains("\\ln"), result.resultLatex());
    }

    @Test
    void derivativeEvaluateAtConvertsToReplaceAll() throws Exception {
        assertEquals(
                "ReplaceAll[D[Power[x,2],x],x->2]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Subscript",["EvaluateAt",["Function",["Block",["D",["Power","x",2],"x"]],"x"]],["Equal","x",2]]
                        """)));
    }

    @Test
    void derivativeEvaluateAtCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Subscript",["EvaluateAt",["Function",["Block",["D",["Power","x",2],"x"]],"x"]],["Equal","x",2]]
                """));

        assertEquals("ReplaceAll[D[Power[x,2],x],x->2]", result.symjaExpression());
        assertEquals("4", result.result());
    }

    @Test
    void nestedDerivativeCalculatesNthDerivative() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["D",["D",["Power","x",5],"x"],"x"]
                """));

        assertEquals("D[D[Power[x,5],x],x]", result.symjaExpression());
        assertEquals("20*x^3", result.result());
    }

    @Test
    void nestedDerivativeEvaluateAtCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Subscript",["EvaluateAt",["Function",["Block",["D",["D",["Power","x",5],"x"],"x"]],"x"]],["Equal","x",2]]
                """));

        assertEquals("ReplaceAll[D[D[Power[x,5],x],x],x->2]", result.symjaExpression());
        assertEquals("160", result.result());
    }

    @Test
    void indefiniteIntegralUsesVariableOnlyWhenLimitsAreNothing() throws Exception {
        assertEquals(
                "Integrate[Power[x,2],x]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Integrate",["Function",["Block",["Power","x",2]],"x"],["Limits","x","Nothing","Nothing"]]
                        """)));
    }

    @Test
    void indefiniteIntegralCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Integrate",["Function",["Block",["Power","x",2]],"x"],["Limits","x","Nothing","Nothing"]]
                """));

        assertEquals("Integrate[Power[x,2],x]", result.symjaExpression());
        assertEquals("x^3/3+C", result.result());
        assertTrue(result.resultLatex().contains("+C"), result.resultLatex());
    }

    @Test
    void definiteIntegralStillUsesRange() throws Exception {
        assertEquals(
                "Integrate[Power[x,2],{x,0,1}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Integrate",["Function",["Block",["Power","x",2]],"x"],["Limits","x",0,1]]
                        """)));
    }

    @Test
    void definiteIntegralDoesNotAppendIntegralConstant() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Integrate",["Function",["Block",["Power","x",2]],"x"],["Limits","x",0,1]]
                """));

        assertEquals("Integrate[Power[x,2],{x,0,1}]", result.symjaExpression());
        assertEquals("1/3", result.result());
    }

    @Test
    void matrixConvertsToSymjaListOfLists() throws Exception {
        assertEquals(
                "{{1,2},{3,4}}",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Matrix",["List",["List",1,2],["List",3,4]],"'[]'"]
                        """)));
    }

    @Test
    void matrixDeterminantConvertsToSymjaDet() throws Exception {
        assertEquals(
                "Det[{{1,2},{3,4}}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Determinant",["Matrix",["List",["List",1,2],["List",3,4]],"'[]'"]]
                        """)));
    }

    @Test
    void matrixMultiplicationUsesDot() throws Exception {
        assertEquals(
                "Dot[{{1,2},{3,4}},{{5,6},{7,8}}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Multiply",
                          ["Matrix",["List",["List",1,2],["List",3,4]],"'[]'"],
                          ["Matrix",["List",["List",5,6],["List",7,8]],"'[]'"]
                        ]
                        """)));
    }

    @Test
    void matrixDeterminantCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Determinant",["Matrix",["List",["List",1,2],["List",3,4]],"'[]'"]]
                """));

        assertEquals("Det[{{1,2},{3,4}}]", result.symjaExpression());
        assertEquals("-2", result.result());
    }

    @Test
    void rowReduceConvertsDirectFunction() throws Exception {
        assertEquals(
                "RowReduce[{{1,2},{2,4}}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["RowReduce",["Matrix",["List",["List",1,2],["List",2,4]],"'[]'"]]
                        """)));
    }

    @Test
    void rowReduceConvertsOperatorNameTupleShape() throws Exception {
        assertEquals(
                "RowReduce[{{1,2},{2,4}}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Tuple","RowReduce",["Matrix",["List",["List",1,2],["List",2,4]],"'[]'"]]
                        """)));
    }

    @Test
    void matrixLinearAlgebraCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult rowReduce = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["RowReduce",["Matrix",["List",["List",1,2],["List",2,4]],"'[]'"]]
                """));
        SymjaCalculateUtil.SymjaCalculateResult rank = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["MatrixRank",["Matrix",["List",["List",1,2],["List",2,4]],"'[]'"]]
                """));
        SymjaCalculateUtil.SymjaCalculateResult nullSpace = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["NullSpace",["Matrix",["List",["List",1,2],["List",2,4]],"'[]'"]]
                """));
        SymjaCalculateUtil.SymjaCalculateResult linearSolve = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["LinearSolve",
                  ["Matrix",["List",["List",2,1],["List",1,-1]],"'[]'"],
                  ["Matrix",["List",["List",5],["List",1]],"'[]'"]
                ]
                """));

        assertEquals("{{1,2},{0,0}}", compact(rowReduce.result()));
        assertEquals("1", rank.result());
        assertEquals("{{-2,1}}", compact(nullSpace.result()));
        assertEquals("{{2},{1}}", compact(linearSolve.result()));
    }

    @Test
    void sumWithLimitsConvertsToSymjaIterator() throws Exception {
        assertEquals(
                "Sum[x,{n,1,10}]",
                MathJsonToSymjaUtil.convertForCalculation(objectMapper.readTree("""
                        ["Sum","x",["Limits","n",1,10]]
                        """)));
    }

    @Test
    void sumWithLimitsCalculates() throws Exception {
        SymjaCalculateUtil.SymjaCalculateResult result = SymjaCalculateUtil.calculate(objectMapper.readTree("""
                ["Sum","n",["Limits","n",1,10]]
                """));

        assertEquals("Sum[n,{n,1,10}]", result.symjaExpression());
        assertEquals("55", result.result());
    }

    private static String compact(String value) {
        return value.replaceAll("\\s+", "");
    }
}
