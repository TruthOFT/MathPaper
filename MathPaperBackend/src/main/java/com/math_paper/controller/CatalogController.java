package com.math_paper.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import com.math_paper.entity.ClassInfo;
import com.math_paper.entity.KnowledgePoint;
import com.math_paper.mapper.ClassInfoMapper;
import com.math_paper.mapper.KnowledgePointMapper;
import com.math_paper.util.SessionUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final KnowledgePointMapper knowledgePointMapper;
    private final ClassInfoMapper classInfoMapper;

    @GetMapping("/knowledge-points")
    public Result<List<KnowledgePoint>> knowledgePoints(HttpSession session) {
        SessionUtil.requireLogin(session);
        return RestUtil.success(knowledgePointMapper.selectList(new LambdaQueryWrapper<KnowledgePoint>()
                .eq(KnowledgePoint::getIsDelete, 0)
                .eq(KnowledgePoint::getStatus, 1)
                .orderByAsc(KnowledgePoint::getSortNo)));
    }

    @GetMapping("/classes")
    public Result<List<ClassInfo>> classes(HttpSession session) {
        SessionUtil.requireRole(session, "teacher");
        return RestUtil.success(classInfoMapper.selectList(new LambdaQueryWrapper<ClassInfo>()
                .eq(ClassInfo::getIsDelete, 0)
                .eq(ClassInfo::getStatus, 1)
                .orderByDesc(ClassInfo::getCreateTime)));
    }
}
