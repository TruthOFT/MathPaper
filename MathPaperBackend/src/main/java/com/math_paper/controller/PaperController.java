package com.math_paper.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.dto.AutoGeneratePaperRequest;
import com.math_paper.dto.PaperResponse;
import com.math_paper.dto.PaperRuleRequest;
import com.math_paper.entity.PaperRule;
import com.math_paper.service.PaperService;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;

    @GetMapping
    public Result<List<PaperResponse>> list(HttpSession session) {
        SessionUtil.requireLogin(session);
        return RestUtil.success(paperService.listPapers());
    }

    @GetMapping("/rules")
    public Result<List<PaperRule>> rules(HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(paperService.listRules());
    }

    @PostMapping("/rules")
    public Result<PaperRule> createRule(@RequestBody PaperRuleRequest request, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(paperService.createRule(request));
    }

    @PutMapping("/rules/{id}")
    public Result<PaperRule> updateRule(@PathVariable Long id, @RequestBody PaperRuleRequest request, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(paperService.updateRule(id, request));
    }

    @DeleteMapping("/rules/{id}")
    public Result<Void> deleteRule(@PathVariable Long id, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        paperService.deleteRule(id);
        return RestUtil.success();
    }

    @PostMapping("/auto-generate")
    public Result<PaperResponse> autoGenerate(@RequestBody AutoGeneratePaperRequest request, HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(paperService.autoGenerate(request));
    }
}
