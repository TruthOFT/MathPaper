package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.QuestionOptionRequest;
import com.math_paper.dto.QuestionOptionResponse;
import com.math_paper.dto.QuestionRequest;
import com.math_paper.dto.QuestionResponse;
import com.math_paper.entity.Question;
import com.math_paper.entity.QuestionKnowledge;
import com.math_paper.entity.QuestionOption;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.QuestionKnowledgeMapper;
import com.math_paper.mapper.QuestionMapper;
import com.math_paper.mapper.QuestionOptionMapper;
import com.math_paper.service.QuestionService;
import com.math_paper.util.LatexAnswerUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionMapper questionMapper;
    private final QuestionKnowledgeMapper questionKnowledgeMapper;
    private final QuestionOptionMapper questionOptionMapper;

    @Override
    public List<QuestionResponse> list(String questionType) {
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<Question>()
                .eq(Question::getIsDelete, 0)
                .orderByDesc(Question::getCreateTime);
        if (!isBlank(questionType)) {
            wrapper.eq(Question::getQuestionType, questionType);
        }
        return questionMapper.selectList(wrapper).stream().map(this::toResponse).toList();
    }

    @Override
    public QuestionResponse detail(Long id) {
        Question question = findQuestion(id);
        return toResponse(question);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public QuestionResponse save(QuestionRequest request) {
        if (request == null || isBlank(request.stemContent())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "题干不能为空");
        }
        String answerValue = LatexAnswerUtil.normalize(isBlank(request.answerValue()) ? request.answerContent() : request.answerValue());
        Question question = request.id() == null ? new Question() : findQuestion(request.id());
        if (question.getId() == null) {
            question.setQuestionCode("Q_" + System.currentTimeMillis());
            question.setSubjectCode("math");
            question.setSchoolStage("senior_high");
            question.setGradeLevel("grade_11");
            question.setSourceType("manual");
            question.setStatus(1);
            question.setIsDelete(0);
        }
        question.setQuestionType(defaultValue(request.questionType(), "calculation"));
        question.setInputType(defaultValue(request.inputType(), "formula"));
        question.setStemContent(request.stemContent());
        question.setAnswerValueType("latex");
        question.setAnswerValue(answerValue);
        question.setAnswerContent(LatexAnswerUtil.display(answerValue));
        question.setAnswerExpr(null);
        question.setAnalysisContent(request.analysisContent());
        question.setJudgeMode("exact_match");
        question.setDifficulty(request.difficulty() == null ? new BigDecimal("0.50") : request.difficulty());
        question.setDefaultScore(request.defaultScore() == null ? new BigDecimal("10.00") : request.defaultScore());
        question.setBlankCount(request.blankCount() == null ? 0 : request.blankCount());
        question.setEstimatedMinutes(request.estimatedMinutes() == null ? 3 : request.estimatedMinutes());

        if (question.getId() == null) {
            questionMapper.insert(question);
        } else {
            questionMapper.updateById(question);
        }

        replaceKnowledge(question.getId(), request.knowledgePointIds());
        replaceOptions(question.getId(), request.options());
        return detail(question.getId());
    }

    @Override
    public void delete(Long id) {
        Question question = findQuestion(id);
        question.setIsDelete(1);
        questionMapper.updateById(question);
    }

    private Question findQuestion(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "题目 id 不能为空");
        }
        Question question = questionMapper.selectById(id);
        if (question == null || question.getIsDelete() != null && question.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        return question;
    }

    private void replaceKnowledge(Long questionId, List<Long> knowledgePointIds) {
        questionKnowledgeMapper.delete(new LambdaQueryWrapper<QuestionKnowledge>()
                .eq(QuestionKnowledge::getQuestionId, questionId));
        if (knowledgePointIds == null) {
            return;
        }
        for (Long knowledgePointId : knowledgePointIds) {
            if (knowledgePointId == null) {
                continue;
            }
            QuestionKnowledge item = new QuestionKnowledge();
            item.setQuestionId(questionId);
            item.setKnowledgePointId(knowledgePointId);
            item.setWeight(BigDecimal.ONE);
            item.setIsDelete(0);
            questionKnowledgeMapper.insert(item);
        }
    }

    private void replaceOptions(Long questionId, List<QuestionOptionRequest> options) {
        questionOptionMapper.delete(new LambdaQueryWrapper<QuestionOption>()
                .eq(QuestionOption::getQuestionId, questionId));
        if (options == null) {
            return;
        }
        for (QuestionOptionRequest request : options) {
            if (request == null || isBlank(request.optionKey()) || isBlank(request.optionContent())) {
                continue;
            }
            QuestionOption option = new QuestionOption();
            option.setQuestionId(questionId);
            option.setOptionKey(request.optionKey());
            option.setOptionContent(request.optionContent());
            option.setIsCorrect(request.isCorrect() == null ? 0 : request.isCorrect());
            option.setSortNo(request.sortNo() == null ? 0 : request.sortNo());
            option.setIsDelete(0);
            questionOptionMapper.insert(option);
        }
    }

    private QuestionResponse toResponse(Question question) {
        List<Long> knowledgePointIds = questionKnowledgeMapper.selectList(new LambdaQueryWrapper<QuestionKnowledge>()
                        .eq(QuestionKnowledge::getQuestionId, question.getId())
                        .eq(QuestionKnowledge::getIsDelete, 0))
                .stream()
                .map(QuestionKnowledge::getKnowledgePointId)
                .toList();
        List<QuestionOptionResponse> options = new ArrayList<>(questionOptionMapper.selectList(new LambdaQueryWrapper<QuestionOption>()
                        .eq(QuestionOption::getQuestionId, question.getId())
                        .eq(QuestionOption::getIsDelete, 0))
                .stream()
                .map(option -> new QuestionOptionResponse(option.getId(), option.getOptionKey(), option.getOptionContent(), option.getIsCorrect(), option.getSortNo()))
                .toList());
        options.sort(Comparator.comparing(QuestionOptionResponse::sortNo, Comparator.nullsLast(Integer::compareTo)));
        return new QuestionResponse(
                question.getId(),
                question.getQuestionCode(),
                question.getQuestionType(),
                question.getInputType(),
                question.getStemContent(),
                question.getAnswerContent(),
                question.getAnswerValue(),
                question.getAnalysisContent(),
                question.getDifficulty(),
                question.getDefaultScore(),
                question.getBlankCount(),
                question.getEstimatedMinutes(),
                knowledgePointIds,
                options
        );
    }

    private String defaultValue(String value, String defaultValue) {
        return isBlank(value) ? defaultValue : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
