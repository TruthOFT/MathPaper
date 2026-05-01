package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.DashboardMetricResponse;
import com.math_paper.dto.DashboardSummaryResponse;
import com.math_paper.dto.TaskSummaryResponse;
import com.math_paper.dto.WeakKnowledgePointResponse;
import com.math_paper.entity.HomeworkTask;
import com.math_paper.entity.HomeworkTaskStudent;
import com.math_paper.entity.KnowledgePoint;
import com.math_paper.entity.Paper;
import com.math_paper.entity.Question;
import com.math_paper.entity.QuestionKnowledge;
import com.math_paper.entity.StudentAnswer;
import com.math_paper.entity.WrongQuestionBook;
import com.math_paper.mapper.HomeworkTaskMapper;
import com.math_paper.mapper.HomeworkTaskStudentMapper;
import com.math_paper.mapper.KnowledgePointMapper;
import com.math_paper.mapper.PaperMapper;
import com.math_paper.mapper.QuestionKnowledgeMapper;
import com.math_paper.mapper.QuestionMapper;
import com.math_paper.mapper.StudentAnswerMapper;
import com.math_paper.mapper.WrongQuestionBookMapper;
import com.math_paper.service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final QuestionMapper questionMapper;
    private final PaperMapper paperMapper;
    private final HomeworkTaskMapper homeworkTaskMapper;
    private final HomeworkTaskStudentMapper homeworkTaskStudentMapper;
    private final WrongQuestionBookMapper wrongQuestionBookMapper;
    private final StudentAnswerMapper studentAnswerMapper;
    private final QuestionKnowledgeMapper questionKnowledgeMapper;
    private final KnowledgePointMapper knowledgePointMapper;

    @Override
    public DashboardSummaryResponse summary(AuthUserResponse user) {
        if ("teacher".equals(user.roleType()) || "admin".equals(user.roleType())) {
            return teacherSummary(user);
        }
        return studentSummary(user);
    }

    private DashboardSummaryResponse teacherSummary(AuthUserResponse teacher) {
        List<HomeworkTask> tasks = homeworkTaskMapper.selectList(new LambdaQueryWrapper<HomeworkTask>()
                .eq(!"admin".equals(teacher.roleType()), HomeworkTask::getTeacherId, teacher.id())
                .eq(HomeworkTask::getIsDelete, 0)
                .orderByDesc(HomeworkTask::getCreateTime));
        List<Long> taskIds = tasks.stream().map(HomeworkTask::getId).toList();
        List<HomeworkTaskStudent> taskStudents = taskIds.isEmpty()
                ? List.of()
                : homeworkTaskStudentMapper.selectList(new LambdaQueryWrapper<HomeworkTaskStudent>()
                .in(HomeworkTaskStudent::getTaskId, taskIds)
                .eq(HomeworkTaskStudent::getIsDelete, 0));
        long pendingCount = taskStudents.stream()
                .filter(item -> !"corrected".equals(item.getStatus()) && !"submitted".equals(item.getStatus()))
                .count();
        BigDecimal averageScore = averageScore(taskStudents);
        List<DashboardMetricResponse> metrics = List.of(
                metric("questions", "题目数", countString(questionMapper.selectCount(new LambdaQueryWrapper<Question>()
                        .eq(Question::getIsDelete, 0)))),
                metric("papers", "试卷数", countString(paperMapper.selectCount(new LambdaQueryWrapper<Paper>()
                        .eq(Paper::getIsDelete, 0)))),
                metric("tasks", "已发布作业", String.valueOf(tasks.size())),
                metric("pending", "待提交人数", String.valueOf(pendingCount)),
                metric("averageScore", "平均分", scoreString(averageScore))
        );
        return new DashboardSummaryResponse(teacher.roleType(), metrics, recentTeacherTasks(tasks), teacherWeakPoints(taskStudents));
    }

    private DashboardSummaryResponse studentSummary(AuthUserResponse student) {
        List<HomeworkTaskStudent> taskStudents = homeworkTaskStudentMapper.selectList(new LambdaQueryWrapper<HomeworkTaskStudent>()
                .eq(HomeworkTaskStudent::getStudentId, student.id())
                .eq(HomeworkTaskStudent::getIsDelete, 0)
                .orderByDesc(HomeworkTaskStudent::getCreateTime));
        long pendingCount = taskStudents.stream()
                .filter(item -> !"corrected".equals(item.getStatus()) && !"submitted".equals(item.getStatus()))
                .count();
        long correctedCount = taskStudents.stream()
                .filter(item -> "corrected".equals(item.getStatus()))
                .count();
        Long wrongCount = wrongQuestionBookMapper.selectCount(new LambdaQueryWrapper<WrongQuestionBook>()
                .eq(WrongQuestionBook::getStudentId, student.id())
                .eq(WrongQuestionBook::getIsDelete, 0)
                .eq(WrongQuestionBook::getMastered, 0));
        List<DashboardMetricResponse> metrics = List.of(
                metric("tasks", "我的作业", String.valueOf(taskStudents.size())),
                metric("pending", "待完成", String.valueOf(pendingCount)),
                metric("corrected", "已批改", String.valueOf(correctedCount)),
                metric("averageScore", "平均分", scoreString(averageScore(taskStudents))),
                metric("wrongQuestions", "未掌握错题", countString(wrongCount))
        );
        return new DashboardSummaryResponse(student.roleType(), metrics, recentStudentTasks(taskStudents), studentWeakPoints(student.id()));
    }

    private List<TaskSummaryResponse> recentTeacherTasks(List<HomeworkTask> tasks) {
        return tasks.stream()
                .limit(5)
                .map(task -> new TaskSummaryResponse(task.getId(), null, task.getPaperId(), task.getTaskName(), "published", null, task.getDeadlineTime()))
                .toList();
    }

    private List<TaskSummaryResponse> recentStudentTasks(List<HomeworkTaskStudent> taskStudents) {
        return taskStudents.stream()
                .limit(5)
                .map(taskStudent -> {
                    HomeworkTask task = homeworkTaskMapper.selectById(taskStudent.getTaskId());
                    return new TaskSummaryResponse(
                            taskStudent.getTaskId(),
                            taskStudent.getId(),
                            taskStudent.getPaperId(),
                            task == null ? "作业" : task.getTaskName(),
                            taskStudent.getStatus(),
                            taskStudent.getTotalScore(),
                            task == null ? null : task.getDeadlineTime()
                    );
                })
                .toList();
    }

    private List<WeakKnowledgePointResponse> studentWeakPoints(Long studentId) {
        List<WrongQuestionBook> wrongs = wrongQuestionBookMapper.selectList(new LambdaQueryWrapper<WrongQuestionBook>()
                .eq(WrongQuestionBook::getStudentId, studentId)
                .eq(WrongQuestionBook::getIsDelete, 0)
                .eq(WrongQuestionBook::getMastered, 0));
        return weakPointsFromWrongs(wrongs);
    }

    private List<WeakKnowledgePointResponse> teacherWeakPoints(List<HomeworkTaskStudent> taskStudents) {
        List<Long> taskStudentIds = taskStudents.stream().map(HomeworkTaskStudent::getId).toList();
        if (taskStudentIds.isEmpty()) {
            return List.of();
        }
        List<Long> answerIds = studentAnswerMapper.selectList(new LambdaQueryWrapper<StudentAnswer>()
                        .in(StudentAnswer::getTaskStudentId, taskStudentIds)
                        .eq(StudentAnswer::getIsDelete, 0))
                .stream()
                .map(StudentAnswer::getId)
                .toList();
        if (answerIds.isEmpty()) {
            return List.of();
        }
        List<WrongQuestionBook> wrongs = wrongQuestionBookMapper.selectList(new LambdaQueryWrapper<WrongQuestionBook>()
                .in(WrongQuestionBook::getStudentAnswerId, answerIds)
                .eq(WrongQuestionBook::getIsDelete, 0)
                .eq(WrongQuestionBook::getMastered, 0));
        return weakPointsFromWrongs(wrongs);
    }

    private List<WeakKnowledgePointResponse> weakPointsFromWrongs(List<WrongQuestionBook> wrongs) {
        Map<Long, Long> countMap = new HashMap<>();
        for (WrongQuestionBook wrong : wrongs) {
            if (wrong.getQuestionId() == null) {
                continue;
            }
            List<QuestionKnowledge> links = questionKnowledgeMapper.selectList(new LambdaQueryWrapper<QuestionKnowledge>()
                    .eq(QuestionKnowledge::getQuestionId, wrong.getQuestionId())
                    .eq(QuestionKnowledge::getIsDelete, 0));
            for (QuestionKnowledge link : links) {
                countMap.merge(link.getKnowledgePointId(), 1L, Long::sum);
            }
        }
        return countMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    KnowledgePoint point = knowledgePointMapper.selectById(entry.getKey());
                    return new WeakKnowledgePointResponse(entry.getKey(), point == null ? "知识点" : point.getPointName(), entry.getValue());
                })
                .toList();
    }

    private BigDecimal averageScore(List<HomeworkTaskStudent> taskStudents) {
        List<BigDecimal> scores = taskStudents.stream()
                .map(HomeworkTaskStudent::getTotalScore)
                .filter(score -> score != null && score.compareTo(BigDecimal.ZERO) > 0)
                .toList();
        if (scores.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(scores.size()), 1, RoundingMode.HALF_UP);
    }

    private DashboardMetricResponse metric(String key, String label, String value) {
        return new DashboardMetricResponse(key, label, value);
    }

    private String scoreString(BigDecimal score) {
        return score == null ? "0" : score.stripTrailingZeros().toPlainString();
    }

    private String countString(Long count) {
        return String.valueOf(count == null ? 0 : count);
    }
}
