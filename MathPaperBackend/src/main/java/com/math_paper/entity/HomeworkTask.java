package com.math_paper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("homework_task")
public class HomeworkTask {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String taskCode;
    private Long paperId;
    private String taskName;
    private Long teacherId;
    private Long classId;
    private String pushType;
    private LocalDateTime publishTime;
    private LocalDateTime deadlineTime;
    private Integer allowRetry;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer isDelete;
}
