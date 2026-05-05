package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.GradingInfo;
import com.math_paper.dto.PaperQuestionResponse;
import com.math_paper.dto.PublishTaskRequest;
import com.math_paper.dto.QuestionOptionResponse;
import com.math_paper.dto.SubmitAnswerItem;
import com.math_paper.dto.SubmitAnswersRequest;
import com.math_paper.dto.SubmitResultResponse;
import com.math_paper.dto.TaskDetailResponse;
import com.math_paper.dto.TaskStatisticsResponse;
import com.math_paper.dto.TaskStudentResponse;
import com.math_paper.dto.TaskSummaryResponse;
import com.math_paper.entity.AnswerJudgeRecord;
import com.math_paper.entity.ClassStudent;
import com.math_paper.entity.HomeworkTask;
import com.math_paper.entity.HomeworkTaskStudent;
import com.math_paper.entity.Paper;
import com.math_paper.entity.PaperQuestion;
import com.math_paper.entity.PaperQuestionOption;
import com.math_paper.entity.StudentAnswer;
import com.math_paper.entity.UserAccount;
import com.math_paper.entity.WrongQuestionBook;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.AnswerJudgeRecordMapper;
import com.math_paper.mapper.ClassStudentMapper;
import com.math_paper.mapper.HomeworkTaskMapper;
import com.math_paper.mapper.HomeworkTaskStudentMapper;
import com.math_paper.mapper.KnowledgePointMapper;
import com.math_paper.mapper.PaperMapper;
import com.math_paper.mapper.PaperQuestionMapper;
import com.math_paper.mapper.PaperQuestionOptionMapper;
import com.math_paper.mapper.QuestionKnowledgeMapper;
import com.math_paper.mapper.StudentAnswerMapper;
import com.math_paper.mapper.UserAccountMapper;
import com.math_paper.mapper.WrongQuestionBookMapper;
import com.math_paper.service.TaskService;
import com.math_paper.util.LatexAnswerUtil;
import com.math_paper.util.LatexToSymjaUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final HomeworkTaskMapper homeworkTaskMapper;
    private final HomeworkTaskStudentMapper homeworkTaskStudentMapper;
    private final ClassStudentMapper classStudentMapper;
    private final PaperMapper paperMapper;
    private final PaperQuestionMapper paperQuestionMapper;
    private final PaperQuestionOptionMapper paperQuestionOptionMapper;
    private final StudentAnswerMapper studentAnswerMapper;
    private final AnswerJudgeRecordMapper answerJudgeRecordMapper;
    private final WrongQuestionBookMapper wrongQuestionBookMapper;
    private final UserAccountMapper userAccountMapper;
    private final QuestionKnowledgeMapper questionKnowledgeMapper;
    private final KnowledgePointMapper knowledgePointMapper;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public TaskSummaryResponse publish(PublishTaskRequest request, AuthUserResponse teacher) {
        if (request == null || request.paperId() == null || request.classId() == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "试卷和班级不能为空");
        }
        Paper paper = paperMapper.selectById(request.paperId());
        if (paper == null || paper.getIsDelete() != null && paper.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "试卷不存在");
        }
        List<ClassStudent> students = classStudentMapper.selectList(new LambdaQueryWrapper<ClassStudent>()
                .eq(ClassStudent::getClassId, request.classId())
                .eq(ClassStudent::getStatus, 1)
                .eq(ClassStudent::getIsDelete, 0));
        if (students.isEmpty()) {
            throw new BusinessException(ErrorCode.BUSINESS_ERROR, "班级暂无学生");
        }

        HomeworkTask task = new HomeworkTask();
        task.setTaskCode("TASK_" + System.currentTimeMillis());
        task.setPaperId(paper.getId());
        task.setTaskName(isBlank(request.taskName()) ? paper.getPaperName() : request.taskName());
        task.setTeacherId(teacher.id());
        task.setClassId(request.classId());
        task.setPushType("manual");
        task.setPublishTime(LocalDateTime.now());
        task.setDeadlineTime(LocalDateTime.now().plusDays(request.deadlineDays() == null ? 7 : request.deadlineDays()));
        task.setAllowRetry(1);
        task.setStatus(1);
        task.setRemark("教师发布作业");
        task.setIsDelete(0);
        homeworkTaskMapper.insert(task);

        for (ClassStudent student : students) {
            HomeworkTaskStudent taskStudent = new HomeworkTaskStudent();
            taskStudent.setTaskId(task.getId());
            taskStudent.setStudentId(student.getStudentId());
            taskStudent.setPaperId(paper.getId());
            taskStudent.setStatus("pending");
            taskStudent.setObjectiveScore(BigDecimal.ZERO);
            taskStudent.setTotalScore(BigDecimal.ZERO);
            taskStudent.setAutoCorrectStatus("waiting");
            taskStudent.setTeacherReviewStatus("not_required");
            taskStudent.setIsDelete(0);
            homeworkTaskStudentMapper.insert(taskStudent);
        }

        return new TaskSummaryResponse(task.getId(), null, paper.getId(), task.getTaskName(), "published", paper.getTotalScore(), task.getDeadlineTime());
    }

    @Override
    public List<TaskSummaryResponse> listMyTasks(AuthUserResponse user) {
        if ("teacher".equals(user.roleType()) || "admin".equals(user.roleType())) {
            return homeworkTaskMapper.selectList(new LambdaQueryWrapper<HomeworkTask>()
                            .eq(HomeworkTask::getTeacherId, user.id())
                            .eq(HomeworkTask::getIsDelete, 0)
                            .orderByDesc(HomeworkTask::getCreateTime))
                    .stream()
                    .map(task -> new TaskSummaryResponse(task.getId(), null, task.getPaperId(), task.getTaskName(), "published", null, task.getDeadlineTime()))
                    .toList();
        }

        return homeworkTaskStudentMapper.selectList(new LambdaQueryWrapper<HomeworkTaskStudent>()
                        .eq(HomeworkTaskStudent::getStudentId, user.id())
                        .eq(HomeworkTaskStudent::getIsDelete, 0)
                        .orderByDesc(HomeworkTaskStudent::getCreateTime))
                .stream()
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

    @Override
    public List<TaskStudentResponse> listTaskStudents(Long taskId, AuthUserResponse teacher) {
        HomeworkTask task = findTask(taskId);
        ensureTaskOwner(task, teacher);
        return homeworkTaskStudentMapper.selectList(new LambdaQueryWrapper<HomeworkTaskStudent>()
                        .eq(HomeworkTaskStudent::getTaskId, taskId)
                        .eq(HomeworkTaskStudent::getIsDelete, 0)
                        .orderByAsc(HomeworkTaskStudent::getCreateTime))
                .stream()
                .map(taskStudent -> {
                    UserAccount student = userAccountMapper.selectById(taskStudent.getStudentId());
                    ClassStudent classStudent = classStudentMapper.selectOne(new LambdaQueryWrapper<ClassStudent>()
                            .eq(ClassStudent::getClassId, task.getClassId())
                            .eq(ClassStudent::getStudentId, taskStudent.getStudentId())
                            .eq(ClassStudent::getIsDelete, 0)
                            .last("limit 1"));
                    return new TaskStudentResponse(
                            taskStudent.getId(),
                            taskStudent.getStudentId(),
                            student == null ? "学生" : student.getRealName(),
                            classStudent == null ? "" : classStudent.getStudentNo(),
                            taskStudent.getStatus(),
                            taskStudent.getTotalScore(),
                            taskStudent.getSubmitTime(),
                            wrongCount(taskStudent.getId())
                    );
                })
                .toList();
    }

    @Override
    public TaskDetailResponse detail(Long taskStudentId, AuthUserResponse user) {
        HomeworkTaskStudent taskStudent = findTaskStudent(taskStudentId);
        HomeworkTask task = homeworkTaskMapper.selectById(taskStudent.getTaskId());
        if ("student".equals(user.roleType()) && !taskStudent.getStudentId().equals(user.id())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        if (("teacher".equals(user.roleType()) || "admin".equals(user.roleType())) && task != null) {
            ensureTaskOwner(task, user);
        }
        List<PaperQuestion> questions = paperQuestionMapper.selectList(new LambdaQueryWrapper<PaperQuestion>()
                .eq(PaperQuestion::getPaperId, taskStudent.getPaperId())
                .eq(PaperQuestion::getIsDelete, 0)
                .orderByAsc(PaperQuestion::getQuestionNo));
        Map<Long, StudentAnswer> answerMap = new HashMap<>();
        studentAnswerMapper.selectList(new LambdaQueryWrapper<StudentAnswer>()
                        .eq(StudentAnswer::getTaskStudentId, taskStudentId)
                        .eq(StudentAnswer::getIsDelete, 0))
                .forEach(answer -> answerMap.put(answer.getPaperQuestionId(), answer));

        List<PaperQuestionResponse> responses = questions.stream()
                .map(question -> toQuestionResponse(question, answerMap.get(question.getId())))
                .toList();
        return new TaskDetailResponse(taskStudent.getTaskId(), taskStudent.getId(), taskStudent.getPaperId(), task == null ? "作业" : task.getTaskName(), taskStudent.getStatus(), responses);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public SubmitResultResponse submit(SubmitAnswersRequest request, AuthUserResponse student) {
        if (request == null || request.taskStudentId() == null || request.answers() == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "提交内容不能为空");
        }
        HomeworkTaskStudent taskStudent = findTaskStudent(request.taskStudentId());
        if (!taskStudent.getStudentId().equals(student.id())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        Map<Long, String> answerMap = new HashMap<>();
        for (SubmitAnswerItem item : request.answers()) {
            if (item != null && item.paperQuestionId() != null) {
                answerMap.put(item.paperQuestionId(), item.answerLatex());
            }
        }

        List<PaperQuestion> questions = paperQuestionMapper.selectList(new LambdaQueryWrapper<PaperQuestion>()
                .eq(PaperQuestion::getPaperId, taskStudent.getPaperId())
                .eq(PaperQuestion::getIsDelete, 0));
        BigDecimal totalScore = BigDecimal.ZERO;
        for (PaperQuestion question : questions) {
            String rawLatex = answerMap.getOrDefault(question.getId(), "");
            String answerValue = LatexAnswerUtil.normalize(rawLatex);
            String standardValue = LatexAnswerUtil.normalize(question.getAnswerValueSnapshot());
            boolean correct = !standardValue.isBlank() && standardValue.equals(answerValue);
            boolean symjaEquivalent = false;
            String symjaStandardExpr = null;
            String symjaStudentExpr = null;

            // exact_match 失败时，尝试 Symja 符号等价判题
            if (!correct && !rawLatex.isBlank()) {
                symjaStandardExpr = LatexToSymjaUtil.tryConvert(question.getAnswerValueSnapshot());
                symjaStudentExpr = LatexToSymjaUtil.tryConvert(rawLatex);
                if (symjaStandardExpr != null && symjaStudentExpr != null) {
                    symjaEquivalent = LatexToSymjaUtil.areEquivalent(rawLatex, question.getAnswerValueSnapshot());
                    if (symjaEquivalent) {
                        correct = true;
                    }
                }
            }

            BigDecimal judgeScore = correct ? question.getScore() : BigDecimal.ZERO;
            totalScore = totalScore.add(judgeScore);
            StudentAnswer answer = upsertStudentAnswer(taskStudent, question, rawLatex, answerValue, correct, judgeScore, standardValue, symjaEquivalent);
            saveJudgeRecord(answer, question, rawLatex, answerValue, correct, judgeScore, standardValue, symjaEquivalent, symjaStandardExpr, symjaStudentExpr);
            if (!correct) {
                saveWrongQuestion(taskStudent, question, answer);
            }
        }

        taskStudent.setStatus("corrected");
        taskStudent.setSubmitTime(LocalDateTime.now());
        taskStudent.setObjectiveScore(totalScore);
        taskStudent.setTotalScore(totalScore);
        taskStudent.setAutoCorrectStatus("finished");
        homeworkTaskStudentMapper.updateById(taskStudent);
        return new SubmitResultResponse(taskStudent.getId(), taskStudent.getStatus(), totalScore);
    }

    @Override
    public TaskStatisticsResponse statistics(Long taskId, AuthUserResponse teacher) {
        HomeworkTask task = findTask(taskId);
        ensureTaskOwner(task, teacher);

        List<HomeworkTaskStudent> taskStudents = homeworkTaskStudentMapper.selectList(
                new LambdaQueryWrapper<HomeworkTaskStudent>()
                        .eq(HomeworkTaskStudent::getTaskId, taskId)
                        .eq(HomeworkTaskStudent::getIsDelete, 0));

        int totalStudents = taskStudents.size();
        List<HomeworkTaskStudent> submitted = taskStudents.stream()
                .filter(ts -> "corrected".equals(ts.getStatus()) || "submitted".equals(ts.getStatus()))
                .toList();
        int submittedCount = submitted.size();
        int pendingCount = totalStudents - submittedCount;
        double submissionRate = totalStudents == 0 ? 0 : (double) submittedCount / totalStudents;

        BigDecimal avgScore = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;
        BigDecimal minScore = totalStudents == 0 ? BigDecimal.ZERO : null;
        if (!submitted.isEmpty()) {
            BigDecimal sum = submitted.stream()
                    .map(ts -> ts.getTotalScore() != null ? ts.getTotalScore() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            avgScore = sum.divide(BigDecimal.valueOf(submittedCount), 2, java.math.RoundingMode.HALF_UP);
            maxScore = submitted.stream()
                    .map(ts -> ts.getTotalScore() != null ? ts.getTotalScore() : BigDecimal.ZERO)
                    .max(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);
            minScore = submitted.stream()
                    .map(ts -> ts.getTotalScore() != null ? ts.getTotalScore() : BigDecimal.ZERO)
                    .min(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);
        }

        // Score distribution
        Map<String, Integer> scoreDistribution = new java.util.LinkedHashMap<>();
        int[] buckets = {0, 60, 70, 80, 90, 101};
        String[] bucketLabels = {"0-59", "60-69", "70-79", "80-89", "90-100"};
        for (String label : bucketLabels) {
            scoreDistribution.put(label, 0);
        }
        BigDecimal paperTotalScore = null;
        if (task.getPaperId() != null) {
            Paper paper = paperMapper.selectById(task.getPaperId());
            if (paper != null && paper.getTotalScore() != null) {
                paperTotalScore = paper.getTotalScore();
            }
        }
        for (HomeworkTaskStudent ts : submitted) {
            BigDecimal score = ts.getTotalScore() != null ? ts.getTotalScore() : BigDecimal.ZERO;
            int pct = paperTotalScore != null && paperTotalScore.compareTo(BigDecimal.ZERO) > 0
                    ? score.multiply(BigDecimal.valueOf(100)).divide(paperTotalScore, 0, java.math.RoundingMode.DOWN).intValue()
                    : 0;
            for (int i = 0; i < buckets.length - 1; i++) {
                if (pct >= buckets[i] && pct < buckets[i + 1]) {
                    scoreDistribution.merge(bucketLabels[i], 1, Integer::sum);
                    break;
                }
            }
        }

        // Per-question stats
        List<PaperQuestion> questions = paperQuestionMapper.selectList(
                new LambdaQueryWrapper<PaperQuestion>()
                        .eq(PaperQuestion::getPaperId, task.getPaperId())
                        .eq(PaperQuestion::getIsDelete, 0)
                        .orderByAsc(PaperQuestion::getQuestionNo));

        List<TaskStatisticsResponse.QuestionStat> perQuestionStats = questions.stream().map(q -> {
            long attemptCount = 0;
            long correctCount = 0;
            for (HomeworkTaskStudent ts : submitted) {
                Long count = studentAnswerMapper.selectCount(new LambdaQueryWrapper<StudentAnswer>()
                        .eq(StudentAnswer::getTaskStudentId, ts.getId())
                        .eq(StudentAnswer::getPaperQuestionId, q.getId())
                        .eq(StudentAnswer::getAttemptNo, 1)
                        .eq(StudentAnswer::getIsDelete, 0));
                if (count > 0) {
                    attemptCount++;
                    Long correct = studentAnswerMapper.selectCount(new LambdaQueryWrapper<StudentAnswer>()
                            .eq(StudentAnswer::getTaskStudentId, ts.getId())
                            .eq(StudentAnswer::getPaperQuestionId, q.getId())
                            .eq(StudentAnswer::getIsCorrect, 1)
                            .eq(StudentAnswer::getAttemptNo, 1)
                            .eq(StudentAnswer::getIsDelete, 0));
                    if (correct > 0) correctCount++;
                }
            }
            double correctRate = attemptCount == 0 ? 0 : (double) correctCount / attemptCount;
            return new TaskStatisticsResponse.QuestionStat(
                    q.getId(), q.getQuestionNo(), q.getQuestionType(), q.getScore(),
                    q.getStemContentSnapshot(), attemptCount, correctCount, correctRate);
        }).toList();

        // Weak knowledge points
        List<TaskStatisticsResponse.WeakKpStat> weakKps = new java.util.ArrayList<>();
        Map<Long, Long> wrongKpCount = new java.util.LinkedHashMap<>();
        for (HomeworkTaskStudent ts : submitted) {
            List<StudentAnswer> wrongAnswers = studentAnswerMapper.selectList(
                    new LambdaQueryWrapper<StudentAnswer>()
                            .eq(StudentAnswer::getTaskStudentId, ts.getId())
                            .eq(StudentAnswer::getIsCorrect, 0)
                            .eq(StudentAnswer::getAttemptNo, 1)
                            .eq(StudentAnswer::getIsDelete, 0));
            for (StudentAnswer wa : wrongAnswers) {
                List<com.math_paper.entity.QuestionKnowledge> qks = questionKnowledgeMapper.selectList(
                        new LambdaQueryWrapper<com.math_paper.entity.QuestionKnowledge>()
                                .eq(com.math_paper.entity.QuestionKnowledge::getQuestionId, wa.getQuestionId())
                                .eq(com.math_paper.entity.QuestionKnowledge::getIsDelete, 0));
                for (com.math_paper.entity.QuestionKnowledge qk : qks) {
                    wrongKpCount.merge(qk.getKnowledgePointId(), 1L, Long::sum);
                }
            }
        }
        wrongKpCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .forEach(entry -> {
                    com.math_paper.entity.KnowledgePoint kp = knowledgePointMapper.selectById(entry.getKey());
                    weakKps.add(new TaskStatisticsResponse.WeakKpStat(
                            entry.getKey(),
                            kp != null ? kp.getPointName() : "未知知识点",
                            entry.getValue()));
                });

        return new TaskStatisticsResponse(
                taskId, task.getTaskName(), totalStudents, submittedCount, pendingCount,
                submissionRate, avgScore, maxScore, minScore,
                scoreDistribution, perQuestionStats, weakKps);
    }

    private StudentAnswer upsertStudentAnswer(HomeworkTaskStudent taskStudent, PaperQuestion question, String rawLatex, String answerValue, boolean correct, BigDecimal judgeScore, String standardValue, boolean symjaEquivalent) {
        StudentAnswer answer = studentAnswerMapper.selectOne(new LambdaQueryWrapper<StudentAnswer>()
                .eq(StudentAnswer::getTaskStudentId, taskStudent.getId())
                .eq(StudentAnswer::getPaperQuestionId, question.getId())
                .eq(StudentAnswer::getAttemptNo, 1)
                .eq(StudentAnswer::getIsDelete, 0)
                .last("limit 1"));
        if (answer == null) {
            answer = new StudentAnswer();
            answer.setTaskStudentId(taskStudent.getId());
            answer.setPaperQuestionId(question.getId());
            answer.setQuestionId(question.getQuestionId());
            answer.setStudentId(taskStudent.getStudentId());
            answer.setAttemptNo(1);
            answer.setIsDelete(0);
        }
        answer.setAnswerContent(LatexAnswerUtil.display(answerValue));
        answer.setAnswerValueType("latex");
        answer.setAnswerValue(answerValue);
        answer.setJudgeResult(correct ? "correct" : "wrong");
        answer.setJudgeScore(judgeScore);
        answer.setIsCorrect(correct ? 1 : 0);
        if (correct && symjaEquivalent) {
            answer.setFeedbackContent("表达式数学等价，判为正确。（Symja符号验算通过）");
        } else {
            answer.setFeedbackContent(correct ? "答案正确。" : "字符串比对不一致，标准答案是 " + standardValue + "。");
        }
        answer.setSubmitTime(LocalDateTime.now());
        answer.setAutoCorrectTime(LocalDateTime.now());
        answer.setReviewerId(0L);
        if (answer.getId() == null) {
            studentAnswerMapper.insert(answer);
        } else {
            studentAnswerMapper.updateById(answer);
        }
        return answer;
    }

    private void saveJudgeRecord(StudentAnswer answer, PaperQuestion question, String rawLatex, String answerValue, boolean correct, BigDecimal judgeScore, String standardValue, boolean symjaEquivalent, String symjaStandardExpr, String symjaStudentExpr) {
        AnswerJudgeRecord record = new AnswerJudgeRecord();
        record.setStudentAnswerId(answer.getId());
        record.setQuestionId(question.getQuestionId());
        record.setPaperQuestionId(question.getId());
        record.setJudgeMode(symjaEquivalent ? "symja_equivalent" : "exact_match");
        record.setStandardLatex(question.getAnswerContentSnapshot());
        record.setStudentLatex(LatexAnswerUtil.display(answerValue));
        record.setAnswerValueType("latex");
        record.setStandardAnswerValue(standardValue);
        record.setStudentAnswerValue(answerValue);
        if (symjaEquivalent) {
            record.setStandardExpr(symjaStandardExpr);
            record.setStudentExpr(symjaStudentExpr);
            record.setCalculateResult("symja: Simplify[" + symjaStudentExpr + "-(" + symjaStandardExpr + ")] = 0, 表达式数学等价");
        } else {
            record.setCalculateResult("standardAnswerValue=" + standardValue + "; studentAnswerValue=" + answerValue);
        }
        record.setJudgeResult(correct ? "correct" : "wrong");
        record.setJudgeScore(judgeScore);
        record.setEquivalent(symjaEquivalent ? 1 : (correct ? 1 : 0));
        record.setIsDelete(0);
        answerJudgeRecordMapper.insert(record);
    }

    private void saveWrongQuestion(HomeworkTaskStudent taskStudent, PaperQuestion question, StudentAnswer answer) {
        Long count = wrongQuestionBookMapper.selectCount(new LambdaQueryWrapper<WrongQuestionBook>()
                .eq(WrongQuestionBook::getStudentAnswerId, answer.getId())
                .eq(WrongQuestionBook::getIsDelete, 0));
        if (count > 0) {
            return;
        }
        WrongQuestionBook wrong = new WrongQuestionBook();
        wrong.setStudentId(taskStudent.getStudentId());
        wrong.setQuestionId(question.getQuestionId());
        wrong.setPaperQuestionId(question.getId());
        wrong.setStudentAnswerId(answer.getId());
        wrong.setWrongReason("exact_match");
        wrong.setReviewCount(0);
        wrong.setMastered(0);
        wrong.setIsDelete(0);
        wrongQuestionBookMapper.insert(wrong);
    }

    private PaperQuestionResponse toQuestionResponse(PaperQuestion question, StudentAnswer answer) {
        List<QuestionOptionResponse> options = paperQuestionOptionMapper.selectList(new LambdaQueryWrapper<PaperQuestionOption>()
                        .eq(PaperQuestionOption::getPaperQuestionId, question.getId())
                        .eq(PaperQuestionOption::getIsDelete, 0))
                .stream()
                .sorted(Comparator.comparing(PaperQuestionOption::getSortNo, Comparator.nullsLast(Integer::compareTo)))
                .map(option -> new QuestionOptionResponse(option.getId(), option.getOptionKey(), option.getOptionContent(), 0, option.getSortNo()))
                .toList();
        GradingInfo gradingInfo = null;
        if (answer != null && answer.getId() != null) {
            AnswerJudgeRecord judgeRecord = answerJudgeRecordMapper.selectOne(new LambdaQueryWrapper<AnswerJudgeRecord>()
                    .eq(AnswerJudgeRecord::getStudentAnswerId, answer.getId())
                    .eq(AnswerJudgeRecord::getIsDelete, 0)
                    .last("limit 1"));
            if (judgeRecord != null) {
                gradingInfo = new GradingInfo(
                        judgeRecord.getStandardLatex(),
                        judgeRecord.getStudentLatex(),
                        judgeRecord.getStandardAnswerValue(),
                        judgeRecord.getStudentAnswerValue(),
                        judgeRecord.getCalculateResult(),
                        judgeRecord.getErrorReason(),
                        judgeRecord.getJudgeDetail(),
                        judgeRecord.getEquivalent()
                );
            }
        }
        return new PaperQuestionResponse(
                question.getId(),
                question.getQuestionId(),
                question.getQuestionNo(),
                question.getSectionName(),
                question.getQuestionType(),
                question.getScore(),
                question.getStemContentSnapshot(),
                question.getAnswerContentSnapshot(),
                question.getAnswerValueSnapshot(),
                question.getAnalysisContentSnapshot(),
                answer == null ? "" : answer.getAnswerValue(),
                answer == null ? "pending" : answer.getJudgeResult(),
                answer == null ? BigDecimal.ZERO : answer.getJudgeScore(),
                options,
                gradingInfo
        );
    }

    private HomeworkTaskStudent findTaskStudent(Long taskStudentId) {
        if (taskStudentId == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "学生作业 id 不能为空");
        }
        HomeworkTaskStudent taskStudent = homeworkTaskStudentMapper.selectById(taskStudentId);
        if (taskStudent == null || taskStudent.getIsDelete() != null && taskStudent.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "学生作业不存在");
        }
        return taskStudent;
    }

    private HomeworkTask findTask(Long taskId) {
        if (taskId == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "作业 id 不能为空");
        }
        HomeworkTask task = homeworkTaskMapper.selectById(taskId);
        if (task == null || task.getIsDelete() != null && task.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "作业不存在");
        }
        return task;
    }

    private void ensureTaskOwner(HomeworkTask task, AuthUserResponse user) {
        if (!"admin".equals(user.roleType()) && !task.getTeacherId().equals(user.id())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
    }

    private Long wrongCount(Long taskStudentId) {
        return studentAnswerMapper.selectCount(new LambdaQueryWrapper<StudentAnswer>()
                .eq(StudentAnswer::getTaskStudentId, taskStudentId)
                .eq(StudentAnswer::getJudgeResult, "wrong")
                .eq(StudentAnswer::getIsDelete, 0));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
