package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.QuestionOptionResponse;
import com.math_paper.dto.WrongQuestionResponse;
import com.math_paper.entity.HomeworkTask;
import com.math_paper.entity.HomeworkTaskStudent;
import com.math_paper.entity.PaperQuestion;
import com.math_paper.entity.PaperQuestionOption;
import com.math_paper.entity.Question;
import com.math_paper.entity.QuestionOption;
import com.math_paper.entity.StudentAnswer;
import com.math_paper.entity.WrongQuestionBook;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.HomeworkTaskMapper;
import com.math_paper.mapper.HomeworkTaskStudentMapper;
import com.math_paper.mapper.PaperQuestionMapper;
import com.math_paper.mapper.PaperQuestionOptionMapper;
import com.math_paper.mapper.QuestionMapper;
import com.math_paper.mapper.QuestionOptionMapper;
import com.math_paper.mapper.StudentAnswerMapper;
import com.math_paper.mapper.WrongQuestionBookMapper;
import com.math_paper.service.WrongQuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WrongQuestionServiceImpl implements WrongQuestionService {

    private final WrongQuestionBookMapper wrongQuestionBookMapper;
    private final StudentAnswerMapper studentAnswerMapper;
    private final PaperQuestionMapper paperQuestionMapper;
    private final PaperQuestionOptionMapper paperQuestionOptionMapper;
    private final QuestionMapper questionMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final HomeworkTaskStudentMapper homeworkTaskStudentMapper;
    private final HomeworkTaskMapper homeworkTaskMapper;

    @Override
    public List<WrongQuestionResponse> listMine(AuthUserResponse student) {
        return wrongQuestionBookMapper.selectList(new LambdaQueryWrapper<WrongQuestionBook>()
                        .eq(WrongQuestionBook::getStudentId, student.id())
                        .eq(WrongQuestionBook::getIsDelete, 0)
                        .orderByAsc(WrongQuestionBook::getMastered)
                        .orderByDesc(WrongQuestionBook::getCreateTime))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public WrongQuestionResponse review(Long id, AuthUserResponse student) {
        WrongQuestionBook wrong = findMine(id, student);
        wrong.setReviewCount((wrong.getReviewCount() == null ? 0 : wrong.getReviewCount()) + 1);
        wrong.setLastReviewTime(LocalDateTime.now());
        wrongQuestionBookMapper.updateById(wrong);
        return toResponse(wrong);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public WrongQuestionResponse mastered(Long id, AuthUserResponse student) {
        WrongQuestionBook wrong = findMine(id, student);
        wrong.setMastered(1);
        wrong.setReviewCount((wrong.getReviewCount() == null ? 0 : wrong.getReviewCount()) + 1);
        wrong.setLastReviewTime(LocalDateTime.now());
        wrongQuestionBookMapper.updateById(wrong);
        return toResponse(wrong);
    }

    private WrongQuestionBook findMine(Long id, AuthUserResponse student) {
        if (id == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "错题 id 不能为空");
        }
        WrongQuestionBook wrong = wrongQuestionBookMapper.selectById(id);
        if (wrong == null || wrong.getIsDelete() != null && wrong.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "错题不存在");
        }
        if (!wrong.getStudentId().equals(student.id())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        return wrong;
    }

    private WrongQuestionResponse toResponse(WrongQuestionBook wrong) {
        StudentAnswer answer = wrong.getStudentAnswerId() == null ? null : studentAnswerMapper.selectById(wrong.getStudentAnswerId());
        PaperQuestion paperQuestion = wrong.getPaperQuestionId() == null ? null : paperQuestionMapper.selectById(wrong.getPaperQuestionId());
        Question question = wrong.getQuestionId() == null ? null : questionMapper.selectById(wrong.getQuestionId());
        HomeworkTaskStudent taskStudent = answer == null ? null : homeworkTaskStudentMapper.selectById(answer.getTaskStudentId());
        HomeworkTask task = taskStudent == null ? null : homeworkTaskMapper.selectById(taskStudent.getTaskId());

        return new WrongQuestionResponse(
                wrong.getId(),
                taskStudent == null ? null : taskStudent.getId(),
                wrong.getQuestionId(),
                wrong.getPaperQuestionId(),
                task == null ? "作业" : task.getTaskName(),
                paperQuestion == null ? safe(question == null ? null : question.getStemContent()) : safe(paperQuestion.getStemContentSnapshot()),
                answer == null ? "" : safe(answer.getAnswerValue()),
                paperQuestion == null ? safe(question == null ? null : question.getAnswerValue()) : safe(paperQuestion.getAnswerValueSnapshot()),
                paperQuestion == null ? safe(question == null ? null : question.getAnalysisContent()) : safe(paperQuestion.getAnalysisContentSnapshot()),
                safe(wrong.getWrongReason()),
                wrong.getReviewCount(),
                wrong.getMastered(),
                wrong.getCreateTime(),
                options(wrong, paperQuestion)
        );
    }

    private List<QuestionOptionResponse> options(WrongQuestionBook wrong, PaperQuestion paperQuestion) {
        if (paperQuestion != null) {
            return paperQuestionOptionMapper.selectList(new LambdaQueryWrapper<PaperQuestionOption>()
                            .eq(PaperQuestionOption::getPaperQuestionId, paperQuestion.getId())
                            .eq(PaperQuestionOption::getIsDelete, 0))
                    .stream()
                    .sorted(Comparator.comparing(PaperQuestionOption::getSortNo, Comparator.nullsLast(Integer::compareTo)))
                    .map(option -> new QuestionOptionResponse(option.getId(), option.getOptionKey(), option.getOptionContent(), 0, option.getSortNo()))
                    .toList();
        }
        if (wrong.getQuestionId() == null) {
            return List.of();
        }
        return questionOptionMapper.selectList(new LambdaQueryWrapper<QuestionOption>()
                        .eq(QuestionOption::getQuestionId, wrong.getQuestionId())
                        .eq(QuestionOption::getIsDelete, 0))
                .stream()
                .sorted(Comparator.comparing(QuestionOption::getSortNo, Comparator.nullsLast(Integer::compareTo)))
                .map(option -> new QuestionOptionResponse(option.getId(), option.getOptionKey(), option.getOptionContent(), option.getIsCorrect(), option.getSortNo()))
                .toList();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
