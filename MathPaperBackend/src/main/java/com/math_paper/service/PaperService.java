package com.math_paper.service;

import com.math_paper.dto.AutoGeneratePaperRequest;
import com.math_paper.dto.PaperResponse;
import com.math_paper.dto.PaperRuleRequest;
import com.math_paper.entity.PaperRule;

import java.util.List;

public interface PaperService {
    List<PaperRule> listRules();

    PaperRule createRule(PaperRuleRequest request);

    PaperRule updateRule(Long id, PaperRuleRequest request);

    void deleteRule(Long id);

    List<PaperResponse> listPapers();

    PaperResponse autoGenerate(AutoGeneratePaperRequest request);
}
