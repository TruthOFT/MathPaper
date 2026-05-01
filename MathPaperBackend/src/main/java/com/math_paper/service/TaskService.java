package com.math_paper.service;

import com.math_paper.dto.AuthUserResponse;
import com.math_paper.dto.PublishTaskRequest;
import com.math_paper.dto.SubmitAnswersRequest;
import com.math_paper.dto.SubmitResultResponse;
import com.math_paper.dto.TaskDetailResponse;
import com.math_paper.dto.TaskStudentResponse;
import com.math_paper.dto.TaskSummaryResponse;

import java.util.List;

public interface TaskService {
    TaskSummaryResponse publish(PublishTaskRequest request, AuthUserResponse teacher);

    List<TaskSummaryResponse> listMyTasks(AuthUserResponse user);

    List<TaskStudentResponse> listTaskStudents(Long taskId, AuthUserResponse teacher);

    TaskDetailResponse detail(Long taskStudentId, AuthUserResponse user);

    SubmitResultResponse submit(SubmitAnswersRequest request, AuthUserResponse student);
}
