package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("homework_task_student")
public class HomeworkTaskStudent {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long taskId;
    private Long studentId;
    private Long paperId;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime submitTime;
    private BigDecimal objectiveScore;
    private BigDecimal totalScore;
    private String autoCorrectStatus;
    private String teacherReviewStatus;
    private String masterySnapshot;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
