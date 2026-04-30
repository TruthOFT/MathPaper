package com.math_paper.controller;

import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.CalculateRequest;
import com.math_paper.dto.CalculateResponse;
import com.math_paper.util.SymjaCalculateUtil;
import com.math_paper.util.SymjaCalculateUtil.SymjaCalculateResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculateController {

    @PostMapping("/calculate")
    public Result<CalculateResponse> calculate(@RequestBody CalculateRequest request) {
        SymjaCalculateResult result = SymjaCalculateUtil.calculate(request.mathJson());

        return RestUtil.success(new CalculateResponse(
                request.latex(),
                request.mathJson(),
                result.symjaExpression(),
                result.result(),
                result.resultLatex(),
                "计算完成"
        ));
    }
}
