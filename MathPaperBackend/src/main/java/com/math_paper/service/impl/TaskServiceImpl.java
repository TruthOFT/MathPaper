package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.PaperQuestionResponse;
import com.math_paper.dto.PublishTaskRequest;
import com.math_paper.dto.QuestionOptionResponse;
import com.math_paper.dto.SubmitAnswerItem;
import com.math_paper.dto.SubmitAnswersRequest;
import com.math_paper.dto.SubmitResultResponse;
import com.math_paper.dto.TaskDetailResponse;
import com.math_paper.dto.TaskSummaryResponse;
import com.math_paper.entity.AnswerJudgeRecord;
import com.math_paper.entity.ClassStudent;
import com.math_paper.entity.HomeworkTask;
import com.math_paper.entity.HomeworkTaskStudent;
import com.math_paper.entity.Paper;
import com.math_paper.entity.PaperQuestion;
import com.math_paper.entity.PaperQuestionOption;
import com.math_paper.entity.StudentAnswer;
import com.math_paper.entity.WrongQuestionBook;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.AnswerJudgeRecordMapper;
import com.math_paper.mapper.ClassStudentMapper;
import com.math_paper.mapper.HomeworkTaskMapper;
import com.math_paper.mapper.HomeworkTaskStudentMapper;
import com.math_paper.mapper.PaperMapper;
import com.math_paper.mapper.PaperQuestionMapper;
import com.math_paper.mapper.PaperQuestionOptionMapper;
import com.math_paper.mapper.StudentAnswerMapper;
import com.math_paper.mapper.WrongQuestionBookMapper;
import com.math_paper.service.TaskService;
import com.math_paper.util.LatexAnswerUtil;
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
                    .map(task -> new TaskSummaryResponse(task.getId(), null, task.getPaperId(), task.getTaskName(), String.valueOf(task.getStatus()), null, task.getDeadlineTime()))
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
    public TaskDetailResponse detail(Long taskStudentId, AuthUserResponse user) {
        HomeworkTaskStudent taskStudent = findTaskStudent(taskStudentId);
        if ("student".equals(user.roleType()) && !taskStudent.getStudentId().equals(user.id())) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        HomeworkTask task = homeworkTaskMapper.selectById(taskStudent.getTaskId());
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
            BigDecimal judgeScore = correct ? question.getScore() : BigDecimal.ZERO;
            totalScore = totalScore.add(judgeScore);
            StudentAnswer answer = upsertStudentAnswer(taskStudent, question, rawLatex, answerValue, correct, judgeScore, standardValue);
            saveJudgeRecord(answer, question, rawLatex, answerValue, correct, judgeScore, standardValue);
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

    private StudentAnswer upsertStudentAnswer(HomeworkTaskStudent taskStudent, PaperQuestion question, String rawLatex, String answerValue, boolean correct, BigDecimal judgeScore, String standardValue) {
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
        answer.setFeedbackContent(correct ? "答案正确。" : "字符串比对不一致，标准答案是 " + standardValue + "。");
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

    private void saveJudgeRecord(StudentAnswer answer, PaperQuestion question, String rawLatex, String answerValue, boolean correct, BigDecimal judgeScore, String standardValue) {
        AnswerJudgeRecord record = new AnswerJudgeRecord();
        record.setStudentAnswerId(answer.getId());
        record.setQuestionId(question.getQuestionId());
        record.setPaperQuestionId(question.getId());
        record.setJudgeMode("exact_match");
        record.setStandardLatex(question.getAnswerContentSnapshot());
        record.setStudentLatex(LatexAnswerUtil.display(answerValue));
        record.setAnswerValueType("latex");
        record.setStandardAnswerValue(standardValue);
        record.setStudentAnswerValue(answerValue);
        record.setCalculateResult("standardAnswerValue=" + standardValue + "; studentAnswerValue=" + answerValue);
        record.setJudgeResult(correct ? "correct" : "wrong");
        record.setJudgeScore(judgeScore);
        record.setEquivalent(correct ? 1 : 0);
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
                options
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
