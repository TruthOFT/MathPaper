package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AutoGeneratePaperRequest;
import com.math_paper.dto.PaperResponse;
import com.math_paper.entity.KnowledgePoint;
import com.math_paper.entity.Paper;
import com.math_paper.entity.PaperQuestion;
import com.math_paper.entity.PaperQuestionOption;
import com.math_paper.entity.PaperRule;
import com.math_paper.entity.Question;
import com.math_paper.entity.QuestionKnowledge;
import com.math_paper.entity.QuestionOption;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.KnowledgePointMapper;
import com.math_paper.mapper.PaperMapper;
import com.math_paper.mapper.PaperQuestionMapper;
import com.math_paper.mapper.PaperQuestionOptionMapper;
import com.math_paper.mapper.PaperRuleMapper;
import com.math_paper.mapper.QuestionKnowledgeMapper;
import com.math_paper.mapper.QuestionMapper;
import com.math_paper.mapper.QuestionOptionMapper;
import com.math_paper.service.PaperService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PaperServiceImpl implements PaperService {

    private final PaperRuleMapper paperRuleMapper;
    private final PaperMapper paperMapper;
    private final PaperQuestionMapper paperQuestionMapper;
    private final PaperQuestionOptionMapper paperQuestionOptionMapper;
    private final QuestionMapper questionMapper;
    private final QuestionKnowledgeMapper questionKnowledgeMapper;
    private final KnowledgePointMapper knowledgePointMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<PaperRule> listRules() {
        return paperRuleMapper.selectList(new LambdaQueryWrapper<PaperRule>()
                .eq(PaperRule::getIsDelete, 0)
                .eq(PaperRule::getStatus, 1)
                .orderByDesc(PaperRule::getCreateTime));
    }

    @Override
    public List<PaperResponse> listPapers() {
        return paperMapper.selectList(new LambdaQueryWrapper<Paper>()
                        .eq(Paper::getIsDelete, 0)
                        .orderByDesc(Paper::getCreateTime))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public PaperResponse autoGenerate(AutoGeneratePaperRequest request) {
        if (request == null || request.ruleId() == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "组卷规则不能为空");
        }
        PaperRule rule = paperRuleMapper.selectById(request.ruleId());
        if (rule == null || rule.getIsDelete() != null && rule.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "组卷规则不存在");
        }

        JsonNode root = parseRule(rule.getRuleConfig());
        BigDecimal targetDifficulty = rule.getTargetDifficulty() == null ? new BigDecimal("0.50") : rule.getTargetDifficulty();
        List<SectionPick> picked = pickQuestions(root.path("sections"), targetDifficulty);
        if (picked.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_ERROR, "没有抽到题目");
        }

        Paper paper = new Paper();
        paper.setPaperCode("PAPER_" + System.currentTimeMillis());
        paper.setPaperName(isBlank(request.paperName()) ? rule.getRuleName() + "-自动组卷" : request.paperName());
        paper.setRuleId(rule.getId());
        paper.setPaperType(rule.getPaperType());
        paper.setSubjectCode(rule.getSubjectCode());
        paper.setSchoolStage(rule.getSchoolStage());
        paper.setGradeLevel(rule.getGradeLevel());
        paper.setSourceType("auto");
        paper.setDifficulty(targetDifficulty);
        paper.setQuestionCount(picked.size());
        paper.setTotalScore(picked.stream().map(SectionPick::score).reduce(BigDecimal.ZERO, BigDecimal::add));
        paper.setDurationMinutes(Math.max(20, picked.size() * 5));
        paper.setStatus(1);
        paper.setRemark("自动组卷生成");
        paper.setIsDelete(0);
        paperMapper.insert(paper);

        int questionNo = 1;
        for (SectionPick pick : picked) {
            Question question = pick.question();
            PaperQuestion paperQuestion = new PaperQuestion();
            paperQuestion.setPaperId(paper.getId());
            paperQuestion.setQuestionId(question.getId());
            paperQuestion.setTemplateId(question.getTemplateId());
            paperQuestion.setSectionName(pick.sectionName());
            paperQuestion.setQuestionNo(questionNo);
            paperQuestion.setQuestionType(question.getQuestionType());
            paperQuestion.setScore(pick.score());
            paperQuestion.setSortNo(questionNo);
            paperQuestion.setDifficultySnapshot(question.getDifficulty());
            paperQuestion.setStemContentSnapshot(question.getStemContent());
            paperQuestion.setAnswerContentSnapshot(question.getAnswerContent());
            paperQuestion.setAnswerValueTypeSnapshot("latex");
            paperQuestion.setAnswerValueSnapshot(question.getAnswerValue());
            paperQuestion.setAnswerExprSnapshot(question.getAnswerExpr());
            paperQuestion.setAnalysisContentSnapshot(question.getAnalysisContent());
            paperQuestion.setIsDelete(0);
            paperQuestionMapper.insert(paperQuestion);
            copyOptions(question.getId(), paperQuestion.getId());
            questionNo++;
        }

        return toResponse(paper);
    }

    private List<SectionPick> pickQuestions(JsonNode sections, BigDecimal targetDifficulty) {
        if (!sections.isArray()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "组卷规则 sections 格式错误");
        }
        List<SectionPick> result = new ArrayList<>();
        Set<Long> usedQuestionIds = new HashSet<>();
        for (JsonNode section : sections) {
            String questionType = section.path("questionType").asText("calculation");
            String sectionName = section.path("sectionName").asText("计算题");
            int count = section.path("count").asInt(1);
            BigDecimal score = new BigDecimal(section.path("score").asText("10"));
            Set<Long> knowledgePointIds = findKnowledgePointIds(section.path("knowledgePointCodes"));
            List<Question> candidates = findCandidates(questionType, knowledgePointIds, targetDifficulty, usedQuestionIds);
            if (candidates.size() < count) {
                throw new BusinessException(ErrorCode.BUSINESS_ERROR, sectionName + " 可用题目不足");
            }
            for (int i = 0; i < count; i++) {
                Question question = candidates.get(i);
                usedQuestionIds.add(question.getId());
                result.add(new SectionPick(sectionName, score, question));
            }
        }
        return result;
    }

    private Set<Long> findKnowledgePointIds(JsonNode codes) {
        Set<Long> ids = new HashSet<>();
        if (!codes.isArray()) {
            return ids;
        }
        for (JsonNode codeNode : codes) {
            KnowledgePoint point = knowledgePointMapper.selectOne(new LambdaQueryWrapper<KnowledgePoint>()
                    .eq(KnowledgePoint::getPointCode, codeNode.asText())
                    .eq(KnowledgePoint::getIsDelete, 0)
                    .last("limit 1"));
            if (point != null) {
                ids.add(point.getId());
            }
        }
        return ids;
    }

    private List<Question> findCandidates(String questionType, Set<Long> knowledgePointIds, BigDecimal targetDifficulty, Set<Long> usedQuestionIds) {
        List<Question> questions = questionMapper.selectList(new LambdaQueryWrapper<Question>()
                .eq(Question::getQuestionType, questionType)
                .eq(Question::getStatus, 1)
                .eq(Question::getIsDelete, 0));
        Set<Long> matchedQuestionIds = new HashSet<>();
        if (!knowledgePointIds.isEmpty()) {
            List<QuestionKnowledge> links = questionKnowledgeMapper.selectList(new LambdaQueryWrapper<QuestionKnowledge>()
                    .in(QuestionKnowledge::getKnowledgePointId, knowledgePointIds)
                    .eq(QuestionKnowledge::getIsDelete, 0));
            for (QuestionKnowledge link : links) {
                matchedQuestionIds.add(link.getQuestionId());
            }
        }
        return questions.stream()
                .filter(question -> !usedQuestionIds.contains(question.getId()))
                .filter(question -> knowledgePointIds.isEmpty() || matchedQuestionIds.contains(question.getId()))
                .sorted(Comparator.comparing(question -> question.getDifficulty().subtract(targetDifficulty).abs().setScale(2, RoundingMode.HALF_UP)))
                .toList();
    }

    private void copyOptions(Long questionId, Long paperQuestionId) {
        List<QuestionOption> options = questionOptionMapper.selectList(new LambdaQueryWrapper<QuestionOption>()
                .eq(QuestionOption::getQuestionId, questionId)
                .eq(QuestionOption::getIsDelete, 0));
        for (QuestionOption option : options) {
            PaperQuestionOption snapshot = new PaperQuestionOption();
            snapshot.setPaperQuestionId(paperQuestionId);
            snapshot.setOptionKey(option.getOptionKey());
            snapshot.setOptionContent(option.getOptionContent());
            snapshot.setSortNo(option.getSortNo());
            snapshot.setIsDelete(0);
            paperQuestionOptionMapper.insert(snapshot);
        }
    }

    private JsonNode parseRule(String ruleConfig) {
        try {
            return objectMapper.readTree(ruleConfig);
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "组卷规则 JSON 解析失败");
        }
    }

    private PaperResponse toResponse(Paper paper) {
        return new PaperResponse(paper.getId(), paper.getPaperCode(), paper.getPaperName(), paper.getQuestionCount(), paper.getTotalScore());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private record SectionPick(String sectionName, BigDecimal score, Question question) {
    }
}
