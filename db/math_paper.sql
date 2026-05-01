/*
 Navicat Premium Dump SQL

 Source Server         : MyDB
 Source Server Type    : MySQL
 Source Server Version : 80031 (8.0.31)
 Source Host           : localhost:3306
 Source Schema         : math_paper

 Target Server Type    : MySQL
 Target Server Version : 80031 (8.0.31)
 File Encoding         : 65001

 Date: 01/05/2026 19:41:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for answer_judge_record
-- ----------------------------
DROP TABLE IF EXISTS `answer_judge_record`;
CREATE TABLE `answer_judge_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentAnswerId` bigint NOT NULL COMMENT '学生作答记录id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `paperQuestionId` bigint NULL DEFAULT NULL COMMENT '试卷题目id',
  `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exact_match' COMMENT '判题方式：exact_match',
  `standardLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案LaTeX',
  `studentLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案LaTeX',
  `answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'latex' COMMENT '答案值类型：统一为latex',
  `standardAnswerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案判题值',
  `studentAnswerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案判题值',
  `standardExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案Symja表达式',
  `studentExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案Symja表达式',
  `calculateResult` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'Symja计算或化简结果',
  `resultLatex` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '计算结果LaTeX',
  `judgeResult` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '判题结果：pending、correct、wrong、partial、error',
  `judgeScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '本次判题得分',
  `equivalent` tinyint(1) NOT NULL DEFAULT 0 COMMENT '表达式是否等价',
  `judgeDetail` json NULL COMMENT '判题详情：规则命中、容差、变量替换、步骤信息等',
  `errorReason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '判题失败原因',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_studentAnswerId`(`studentAnswerId` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  INDEX `idx_judgeResult`(`judgeResult` ASC) USING BTREE,
  CONSTRAINT `fk_answer_judge_record_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_judge_record_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_answer_judge_record_studentAnswerId` FOREIGN KEY (`studentAnswerId`) REFERENCES `student_answer` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050155276072198151 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '自动批改过程记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of answer_judge_record
-- ----------------------------
INSERT INTO `answer_judge_record` VALUES (1, 1, 1, 3, 'exact_match', '\\(1\\)', '\\(1\\)', 'latex', '1', '1', NULL, NULL, 'standardAnswerValue=1; studentAnswerValue=1', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `answer_judge_record` VALUES (2, 2, 7, 7, 'exact_match', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', '\\(\\sqrt{\\pi}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', '\\sqrt{\\pi}', NULL, NULL, 'standardAnswerValue=\\frac{\\sqrt{\\pi}}{2}; studentAnswerValue=\\sqrt{\\pi}', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706363895810, 2050142706296786945, 12, 2050115169562763266, 'exact_match', 'A', '\\(A\\)', 'latex', 'A', 'A', NULL, NULL, 'standardAnswerValue=A; studentAnswerValue=A', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706451976194, 2050142706451976193, 11, 2050115169629872134, 'exact_match', '\\(4\\)', '\\(4\\)', 'latex', '4', '4', NULL, NULL, 'standardAnswerValue=4; studentAnswerValue=4', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706493919234, 2050142706451976195, 5, 2050115169629872135, 'exact_match', '\\(-\\sin x\\)', '\\(-\\sin(x)\\)', 'latex', '-\\sinx', '-\\sin(x)', NULL, NULL, 'standardAnswerValue=-\\sinx; studentAnswerValue=-\\sin(x)', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706493919237, 2050142706493919236, 2, 2050115169629872136, 'exact_match', '\\(e\\)', '\\(e\\)', 'latex', 'e', 'e', NULL, NULL, 'standardAnswerValue=e; studentAnswerValue=e', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706493919239, 2050142706493919238, 6, 2050115169629872137, 'exact_match', '\\(\\frac{1}{3}\\)', '\\(\\frac13\\)', 'latex', '\\frac{1}{3}', '\\frac13', NULL, NULL, 'standardAnswerValue=\\frac{1}{3}; studentAnswerValue=\\frac13', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706561028099, 2050142706561028098, 1, 2050115169696980994, 'exact_match', '\\(1\\)', '\\(1\\)', 'latex', '1', '1', NULL, NULL, 'standardAnswerValue=1; studentAnswerValue=1', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706561028101, 2050142706561028100, 3, 2050115169696980995, 'exact_match', '\\(\\frac{1}{2}\\)', '\\(\\frac12\\)', 'latex', '\\frac{1}{2}', '\\frac12', NULL, NULL, 'standardAnswerValue=\\frac{1}{2}; studentAnswerValue=\\frac12', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050142706561028104, 2050142706561028103, 8, 2050115169696980996, 'exact_match', '\\(x^2+C\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', 'x^2+C', NULL, NULL, 'standardAnswerValue=x^2+C; studentAnswerValue=x^2+C', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `answer_judge_record` VALUES (2050144676743057409, 2050144676667559937, 12, 1, 'exact_match', 'A', '\\(A\\)', 'latex', 'A', 'A', NULL, NULL, 'standardAnswerValue=A; studentAnswerValue=A', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144676961161217, 2050144676906635266, 11, 2, 'exact_match', '\\(4\\)', '\\(4\\)', 'latex', '4', '4', NULL, NULL, 'standardAnswerValue=4; studentAnswerValue=4', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144677200236545, 2050144677133127681, 1, 3, 'exact_match', '\\(1\\)', '\\(1\\)', 'latex', '1', '1', NULL, NULL, 'standardAnswerValue=1; studentAnswerValue=1', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144677401563138, 2050144677334454274, 4, 4, 'exact_match', '\\(3x^2\\)', '\\(3x^2\\)', 'latex', '3x^2', '3x^2', NULL, NULL, 'standardAnswerValue=3x^2; studentAnswerValue=3x^2', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144677669998594, 2050144677602889730, 6, 5, 'exact_match', '\\(\\frac{1}{3}\\)', '\\(\\frac13\\)', 'latex', '\\frac{1}{3}', '\\frac13', NULL, NULL, 'standardAnswerValue=\\frac{1}{3}; studentAnswerValue=\\frac13', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144678261395457, 2050144678064263169, 9, 6, 'exact_match', '\\(x=-1\\ 或\\ x=1\\)', '\\(\\lbrace1,-1\\rbrace.\\)', 'latex', 'x=-1或x=1', '\\lbrace1,-1\\rbrace.', NULL, NULL, 'standardAnswerValue=x=-1或x=1; studentAnswerValue=\\lbrace1,-1\\rbrace.', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144678752129025, 2050144678651465730, 7, 7, 'exact_match', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', '\\frac{\\sqrt{\\pi}}{2}', NULL, NULL, 'standardAnswerValue=\\frac{\\sqrt{\\pi}}{2}; studentAnswerValue=\\frac{\\sqrt{\\pi}}{2}', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `answer_judge_record` VALUES (2050144679049924610, 2050144678982815746, 2, 8, 'exact_match', '\\(e\\)', '\\(e\\)', 'latex', 'e', 'e', NULL, NULL, 'standardAnswerValue=e; studentAnswerValue=e', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 17:25:56', '2026-05-01 17:25:56', 0);
INSERT INTO `answer_judge_record` VALUES (2050155275937980418, 2050155275917008898, 12, 2050115155235020802, 'exact_match', 'A', '\\(A\\)', 'latex', 'A', 'A', NULL, NULL, 'standardAnswerValue=A; studentAnswerValue=A', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155275937980420, 2050155275937980419, 11, 2050115155432153093, 'exact_match', '\\(4\\)', '\\(4\\)', 'latex', '4', '4', NULL, NULL, 'standardAnswerValue=4; studentAnswerValue=4', NULL, 'correct', 5.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155275937980422, 2050155275937980421, 5, 2050115155432153094, 'exact_match', '\\(-\\sin x\\)', '\\(-sinx4\\)', 'latex', '-sinx', '-sinx4', NULL, NULL, 'standardAnswerValue=-sinx; studentAnswerValue=-sinx4', NULL, 'wrong', 0.00, 0, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155276005089284, 2050155276005089283, 2, 2050115155432153095, 'exact_match', '\\(e\\)', '\\(e\\)', 'latex', 'e', 'e', NULL, NULL, 'standardAnswerValue=e; studentAnswerValue=e', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155276005089286, 2050155276005089285, 6, 2050115155499261954, 'exact_match', '\\(\\frac{1}{3}\\)', '\\(frac(1,3)\\)', 'latex', 'frac(1,3)', 'frac(1,3)', NULL, NULL, 'standardAnswerValue=frac(1,3); studentAnswerValue=frac(1,3)', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155276072198146, 2050155276072198145, 1, 2050115155511844865, 'exact_match', '\\(1\\)', '\\(1\\)', 'latex', '1', '1', NULL, NULL, 'standardAnswerValue=1; studentAnswerValue=1', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155276072198148, 2050155276072198147, 3, 2050115155520233474, 'exact_match', '\\(\\frac{1}{2}\\)', '\\(frac(1,2)\\)', 'latex', 'frac(1,2)', 'frac(1,2)', NULL, NULL, 'standardAnswerValue=frac(1,2); studentAnswerValue=frac(1,2)', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `answer_judge_record` VALUES (2050155276072198150, 2050155276072198149, 8, 2050115155520233475, 'exact_match', '\\(x^2+C\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', 'x^2+C', NULL, NULL, 'standardAnswerValue=x^2+C; studentAnswerValue=x^2+C', NULL, 'correct', 10.00, 1, NULL, NULL, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);

-- ----------------------------
-- Table structure for class_info
-- ----------------------------
DROP TABLE IF EXISTS `class_info`;
CREATE TABLE `class_info`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `classCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班级编码',
  `className` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班级名称',
  `teacherId` bigint NULL DEFAULT NULL COMMENT '班主任或任课教师id',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_classCode_isDelete`(`classCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_teacherId`(`teacherId` ASC) USING BTREE,
  INDEX `idx_schoolStage_gradeLevel`(`schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  CONSTRAINT `fk_class_info_teacherId` FOREIGN KEY (`teacherId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '班级信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of class_info
-- ----------------------------
INSERT INTO `class_info` VALUES (1, 'CLS_MATH_2026_01', '高二数学智能作业演示班', 1, 'math', 'senior_high', 'grade_11', 1, '用于自动组卷、自动批改演示', '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);

-- ----------------------------
-- Table structure for class_student
-- ----------------------------
DROP TABLE IF EXISTS `class_student`;
CREATE TABLE `class_student`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `classId` bigint NOT NULL COMMENT '班级id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `studentNo` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '班内学号',
  `joinTime` datetime NULL DEFAULT NULL COMMENT '加入时间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1在班 0退出',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_classId_studentId_isDelete`(`classId` ASC, `studentId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_studentId`(`studentId` ASC) USING BTREE,
  CONSTRAINT `fk_class_student_classId` FOREIGN KEY (`classId`) REFERENCES `class_info` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_class_student_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '班级学生关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of class_student
-- ----------------------------
INSERT INTO `class_student` VALUES (1, 1, 2, '2026001', '2026-04-30 12:23:07', 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `class_student` VALUES (2, 1, 3, '2026002', '2026-04-30 12:23:07', 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `class_student` VALUES (3, 1, 4, '2026003', '2026-04-30 12:23:07', 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);

-- ----------------------------
-- Table structure for homework_task
-- ----------------------------
DROP TABLE IF EXISTS `homework_task`;
CREATE TABLE `homework_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作业编码',
  `paperId` bigint NOT NULL COMMENT '基础试卷id',
  `taskName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作业名称',
  `teacherId` bigint NOT NULL DEFAULT 0 COMMENT '教师id',
  `classId` bigint NOT NULL DEFAULT 0 COMMENT '班级id',
  `pushType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '推送方式：manual、personalized',
  `publishTime` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `deadlineTime` datetime NULL DEFAULT NULL COMMENT '截止时间',
  `allowRetry` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许重做',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1已发布 2已结束',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskCode_isDelete`(`taskCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperId`(`paperId` ASC) USING BTREE,
  INDEX `idx_teacherId_classId`(`teacherId` ASC, `classId` ASC) USING BTREE,
  CONSTRAINT `fk_homework_task_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050155918748622850 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '作业任务表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of homework_task
-- ----------------------------
INSERT INTO `homework_task` VALUES (1, 'TASK_AUTO_DEMO_001', 1, '智能作业-微积分综合练习', 1, 1, 'manual', '2026-04-30 12:23:27', '2026-05-07 12:23:27', 1, 1, '自动组卷样卷发布给演示班', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `homework_task` VALUES (2050135397193584642, 'TASK_1777625343016', 2050115169562763265, '智能作业练习', 2049803070055718913, 1, 'manual', '2026-05-01 16:49:03', '2026-05-08 16:49:03', 1, 1, '教师发布作业', '2026-05-01 16:49:03', '2026-05-01 16:49:03', 0);
INSERT INTO `homework_task` VALUES (2050145817153343490, 'TASK_1777627827339', 2050115155235020801, '智能作业练习', 2049803070055718913, 1, 'manual', '2026-05-01 17:30:27', '2026-05-08 17:30:27', 1, 1, '教师发布作业', '2026-05-01 17:30:27', '2026-05-01 17:30:27', 0);
INSERT INTO `homework_task` VALUES (2050155918748622849, 'TASK_1777630235741', 2050115169562763265, '智能作业练习', 2049803070055718913, 1, 'manual', '2026-05-01 18:10:36', '2026-05-08 18:10:36', 1, 1, '教师发布作业', '2026-05-01 18:10:35', '2026-05-01 18:10:35', 0);

-- ----------------------------
-- Table structure for homework_task_student
-- ----------------------------
DROP TABLE IF EXISTS `homework_task_student`;
CREATE TABLE `homework_task_student`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskId` bigint NOT NULL COMMENT '作业任务id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `paperId` bigint NOT NULL COMMENT '学生实际作答试卷id，可用于个性化推送',
  `status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态：pending、doing、submitted、corrected',
  `startTime` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `submitTime` datetime NULL DEFAULT NULL COMMENT '提交时间',
  `objectiveScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '客观题自动得分',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总分',
  `autoCorrectStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting' COMMENT '自动批改状态',
  `teacherReviewStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_required' COMMENT '教师复核状态',
  `masterySnapshot` json NULL COMMENT '知识点掌握度快照',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskId_studentId_isDelete`(`taskId` ASC, `studentId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperId`(`paperId` ASC) USING BTREE,
  CONSTRAINT `fk_homework_task_student_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_homework_task_student_taskId` FOREIGN KEY (`taskId`) REFERENCES `homework_task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050155918748622853 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生作业任务表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of homework_task_student
-- ----------------------------
INSERT INTO `homework_task_student` VALUES (1, 1, 2, 1, 'corrected', '2026-04-30 11:23:27', '2026-04-30 12:23:27', 55.00, 70.00, 'finished', 'not_required', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `homework_task_student` VALUES (2, 1, 3, 1, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `homework_task_student` VALUES (3, 1, 4, 1, 'corrected', NULL, '2026-05-01 17:25:56', 50.00, 50.00, 'finished', 'not_required', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `homework_task_student` VALUES (2050135397193584643, 2050135397193584642, 2, 2050115169562763265, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 16:49:03', '2026-05-01 16:49:03', 0);
INSERT INTO `homework_task_student` VALUES (2050135397193584644, 2050135397193584642, 3, 2050115169562763265, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 16:49:03', '2026-05-01 16:49:03', 0);
INSERT INTO `homework_task_student` VALUES (2050135397260693506, 2050135397193584642, 4, 2050115169562763265, 'corrected', NULL, '2026-05-01 17:18:06', 40.00, 40.00, 'finished', 'not_required', NULL, '2026-05-01 16:49:03', '2026-05-01 16:49:03', 0);
INSERT INTO `homework_task_student` VALUES (2050145817153343491, 2050145817153343490, 2, 2050115155235020801, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 17:30:27', '2026-05-01 17:30:27', 0);
INSERT INTO `homework_task_student` VALUES (2050145817153343492, 2050145817153343490, 3, 2050115155235020801, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 17:30:27', '2026-05-01 17:30:27', 0);
INSERT INTO `homework_task_student` VALUES (2050145817153343493, 2050145817153343490, 4, 2050115155235020801, 'corrected', NULL, '2026-05-01 18:08:03', 60.00, 60.00, 'finished', 'not_required', NULL, '2026-05-01 17:30:27', '2026-05-01 17:30:27', 0);
INSERT INTO `homework_task_student` VALUES (2050155918748622850, 2050155918748622849, 2, 2050115169562763265, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 18:10:35', '2026-05-01 18:10:35', 0);
INSERT INTO `homework_task_student` VALUES (2050155918748622851, 2050155918748622849, 3, 2050115169562763265, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 18:10:35', '2026-05-01 18:10:35', 0);
INSERT INTO `homework_task_student` VALUES (2050155918748622852, 2050155918748622849, 4, 2050115169562763265, 'pending', NULL, NULL, 0.00, 0.00, 'waiting', 'not_required', NULL, '2026-05-01 18:10:35', '2026-05-01 18:10:35', 0);

-- ----------------------------
-- Table structure for knowledge_point
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_point`;
CREATE TABLE `knowledge_point`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `parentId` bigint NOT NULL DEFAULT 0 COMMENT '父知识点id，0表示根节点',
  `pointCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识点编码',
  `pointName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识点名称',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段，junior_high等',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级，grade_7等',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pointCode_isDelete`(`pointCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_parentId`(`parentId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '知识点表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of knowledge_point
-- ----------------------------
INSERT INTO `knowledge_point` VALUES (1, 0, 'KP_CALC_ROOT', '微积分与函数综合', 'math', 'senior_high', 'grade_11', 1, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (2, 0, 'KP_ALG_ROOT', '代数与方程', 'math', 'senior_high', 'grade_11', 2, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (3, 1, 'KP_LIMIT', '极限计算', 'math', 'senior_high', 'grade_11', 11, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (4, 1, 'KP_DERIVATIVE', '导数计算', 'math', 'senior_high', 'grade_11', 12, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (5, 1, 'KP_INTEGRAL', '积分计算', 'math', 'senior_high', 'grade_11', 13, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (6, 2, 'KP_EQUATION', '方程求解', 'math', 'senior_high', 'grade_11', 21, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `knowledge_point` VALUES (7, 2, 'KP_FUNCTION', '函数与表达式化简', 'math', 'senior_high', 'grade_11', 22, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);

-- ----------------------------
-- Table structure for paper
-- ----------------------------
DROP TABLE IF EXISTS `paper`;
CREATE TABLE `paper`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '试卷编码',
  `paperName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '试卷名称',
  `ruleId` bigint NULL DEFAULT NULL COMMENT '组卷规则id',
  `paperType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'homework' COMMENT '试卷类型：homework、quiz、practice',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `sourceType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '来源：manual、auto',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '试卷难度',
  `questionCount` int NOT NULL DEFAULT 0 COMMENT '题目数量',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '总分',
  `durationMinutes` int NOT NULL DEFAULT 30 COMMENT '建议时长，分钟',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1已发布',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperCode_isDelete`(`paperCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_ruleId`(`ruleId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  CONSTRAINT `fk_paper_ruleId` FOREIGN KEY (`ruleId`) REFERENCES `paper_rule` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050115169562763266 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of paper
-- ----------------------------
INSERT INTO `paper` VALUES (1, 'PAPER_AUTO_DEMO_001', '高二数学智能作业-自动组卷样卷', 1, 'homework', 'math', 'senior_high', 'grade_11', 'auto', 0.45, 8, 70.00, 40, 1, '由 RULE_AUTO_MATH_001 生成的演示试卷', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper` VALUES (2050115155235020801, 'PAPER_1777620516957', '智能作业自动组卷', 1, 'homework', 'math', 'senior_high', 'grade_11', 'auto', 0.45, 8, 70.00, 40, 1, '自动组卷生成', '2026-05-01 15:28:36', '2026-05-01 15:28:36', 0);
INSERT INTO `paper` VALUES (2050115169562763265, 'PAPER_1777620520383', '智能作业自动组卷', 1, 'homework', 'math', 'senior_high', 'grade_11', 'auto', 0.45, 8, 70.00, 40, 1, '自动组卷生成', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);

-- ----------------------------
-- Table structure for paper_question
-- ----------------------------
DROP TABLE IF EXISTS `paper_question`;
CREATE TABLE `paper_question`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperId` bigint NOT NULL COMMENT '试卷id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `templateId` bigint NULL DEFAULT NULL COMMENT '模板id',
  `sectionName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '大题名称',
  `questionNo` int NOT NULL COMMENT '题号',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型',
  `score` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '题目分值',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `difficultySnapshot` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度快照',
  `stemContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干快照，包含数学式时直接存latex',
  `answerContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案快照，包含数学式时直接存latex',
  `answerValueTypeSnapshot` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'latex' COMMENT '答案值类型快照：统一为latex',
  `answerValueSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案判题值快照，按字符串相等比对',
  `answerExprSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案表达式快照，供symja判等',
  `analysisContentSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析快照，包含数学式时直接存latex',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperId_questionNo_isDelete`(`paperId` ASC, `questionNo` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_templateId`(`templateId` ASC) USING BTREE,
  CONSTRAINT `fk_paper_question_paperId` FOREIGN KEY (`paperId`) REFERENCES `paper` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_paper_question_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_paper_question_templateId` FOREIGN KEY (`templateId`) REFERENCES `question_template` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050115169696980997 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷题目快照表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of paper_question
-- ----------------------------
INSERT INTO `paper_question` VALUES (1, 1, 12, 5, '一、选择题', 1, 'single_choice', 5.00, 1, 0.20, '单选：函数 \\(y=x^2\\) 的导数是？', 'A', 'latex', 'A', NULL, '导数为 2x。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (2, 1, 11, NULL, '二、填空题', 2, 'fill_blank', 5.00, 2, 0.20, '填空：\\(\\sqrt{16}=\\underline{\\quad}\\)', '\\(4\\)', 'latex', '4', NULL, '4 的平方是 16。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (3, 1, 1, 1, '三、计算题', 3, 'calculation', 10.00, 3, 0.35, '计算极限：\\(\\lim_{x \\to 0}\\frac{\\sin x}{x}\\)', '\\(1\\)', 'latex', '1', NULL, '重要极限，答案为 1。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (4, 1, 4, 2, '三、计算题', 4, 'calculation', 10.00, 4, 0.30, '求导：\\(\\frac{d}{dx}x^3\\)', '\\(3x^2\\)', 'latex', '3x^2', NULL, '幂函数求导。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (5, 1, 6, 3, '三、计算题', 5, 'calculation', 10.00, 5, 0.40, '计算定积分：\\(\\int_0^1 x^2\\,dx\\)', '\\(\\frac{1}{3}\\)', 'latex', '\\frac{1}{3}', NULL, '原函数为 x^3/3。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (6, 1, 9, 4, '三、计算题', 6, 'calculation', 10.00, 6, 0.35, '解方程：\\(x^2=1\\)', '\\(x=-1\\ 或\\ x=1\\)', 'latex', 'x=-1或x=1', NULL, '因式分解。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (7, 1, 7, 3, '三、计算题', 7, 'calculation', 10.00, 7, 0.75, '计算广义积分：\\(\\int_0^{\\infty}e^{-x^2}\\,dx\\)', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', NULL, '高斯积分半区间。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (8, 1, 2, 1, '三、计算题', 8, 'calculation', 10.00, 8, 0.50, '计算极限：\\(\\lim_{n \\to \\infty}(1+\\frac{1}{n})^n\\)', '\\(e\\)', 'latex', 'e', NULL, '自然常数 e 的经典定义。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question` VALUES (2050115155235020802, 2050115155235020801, 12, 5, '一、选择题', 1, 'single_choice', 5.00, 1, 0.20, '单选：函数 \\(y=x^2\\) 的导数是？', 'A', 'latex', 'A', NULL, '导数为 2x。', '2026-05-01 15:28:36', '2026-05-01 15:28:36', 0);
INSERT INTO `paper_question` VALUES (2050115155432153093, 2050115155235020801, 11, NULL, '二、填空题', 2, 'fill_blank', 5.00, 2, 0.20, '填空：\\(\\sqrt{16}=\\underline{\\quad}\\)', '\\(4\\)', 'latex', '4', NULL, '4 的平方是 16。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155432153094, 2050115155235020801, 5, 2, '三、计算题', 3, 'calculation', 10.00, 3, 0.45, '求二阶导数：\\(\\frac{d^2}{dx^2}\\sin x\\)', '\\(-\\sin x\\)', 'latex', '-\\sin x', NULL, '先求一阶，再求二阶。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155432153095, 2050115155235020801, 2, 1, '三、计算题', 4, 'calculation', 10.00, 4, 0.50, '计算极限：\\(\\lim_{n \\to \\infty}(1+\\frac{1}{n})^n\\)', '\\(e\\)', 'latex', 'e', NULL, '自然常数 e 的经典定义。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155499261954, 2050115155235020801, 6, 3, '三、计算题', 5, 'calculation', 10.00, 5, 0.40, '计算定积分：\\(\\int_0^1 x^2\\,dx\\)', '\\(\\frac{1}{3}\\)', 'latex', '\\frac{1}{3}', NULL, '原函数为 x^3/3。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155511844865, 2050115155235020801, 1, 1, '三、计算题', 6, 'calculation', 10.00, 6, 0.35, '计算极限：\\(\\lim_{x \\to 0}\\frac{\\sin x}{x}\\)', '\\(1\\)', 'latex', '1', NULL, '重要极限，答案为 1。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155520233474, 2050115155235020801, 3, 1, '三、计算题', 7, 'calculation', 10.00, 7, 0.55, '计算极限：\\(\\lim_{x \\to 0}\\frac{1-\\cos x}{x^2}\\)', '\\(\\frac{1}{2}\\)', 'latex', '\\frac{1}{2}', NULL, '等价无穷小。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115155520233475, 2050115155235020801, 8, 3, '三、计算题', 8, 'calculation', 10.00, 8, 0.35, '计算不定积分：\\(\\int 2x\\,dx\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, '原函数加常数 C。', '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question` VALUES (2050115169562763266, 2050115169562763265, 12, 5, '一、选择题', 1, 'single_choice', 5.00, 1, 0.20, '单选：函数 \\(y=x^2\\) 的导数是？', 'A', 'latex', 'A', NULL, '导数为 2x。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169629872134, 2050115169562763265, 11, NULL, '二、填空题', 2, 'fill_blank', 5.00, 2, 0.20, '填空：\\(\\sqrt{16}=\\underline{\\quad}\\)', '\\(4\\)', 'latex', '4', NULL, '4 的平方是 16。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169629872135, 2050115169562763265, 5, 2, '三、计算题', 3, 'calculation', 10.00, 3, 0.45, '求二阶导数：\\(\\frac{d^2}{dx^2}\\sin x\\)', '\\(-\\sin x\\)', 'latex', '-\\sin x', NULL, '先求一阶，再求二阶。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169629872136, 2050115169562763265, 2, 1, '三、计算题', 4, 'calculation', 10.00, 4, 0.50, '计算极限：\\(\\lim_{n \\to \\infty}(1+\\frac{1}{n})^n\\)', '\\(e\\)', 'latex', 'e', NULL, '自然常数 e 的经典定义。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169629872137, 2050115169562763265, 6, 3, '三、计算题', 5, 'calculation', 10.00, 5, 0.40, '计算定积分：\\(\\int_0^1 x^2\\,dx\\)', '\\(\\frac{1}{3}\\)', 'latex', '\\frac{1}{3}', NULL, '原函数为 x^3/3。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169696980994, 2050115169562763265, 1, 1, '三、计算题', 6, 'calculation', 10.00, 6, 0.35, '计算极限：\\(\\lim_{x \\to 0}\\frac{\\sin x}{x}\\)', '\\(1\\)', 'latex', '1', NULL, '重要极限，答案为 1。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169696980995, 2050115169562763265, 3, 1, '三、计算题', 7, 'calculation', 10.00, 7, 0.55, '计算极限：\\(\\lim_{x \\to 0}\\frac{1-\\cos x}{x^2}\\)', '\\(\\frac{1}{2}\\)', 'latex', '\\frac{1}{2}', NULL, '等价无穷小。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question` VALUES (2050115169696980996, 2050115169562763265, 8, 3, '三、计算题', 8, 'calculation', 10.00, 8, 0.35, '计算不定积分：\\(\\int 2x\\,dx\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, '原函数加常数 C。', '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);

-- ----------------------------
-- Table structure for paper_question_option
-- ----------------------------
DROP TABLE IF EXISTS `paper_question_option`;
CREATE TABLE `paper_question_option`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `paperQuestionId` bigint NOT NULL COMMENT '试卷题目id',
  `optionKey` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项键',
  `optionContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项内容快照，包含数学式时直接存latex',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_paperQuestionId_optionKey_isDelete`(`paperQuestionId` ASC, `optionKey` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  CONSTRAINT `fk_paper_question_option_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050115169629872134 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '试卷题目选项快照表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of paper_question_option
-- ----------------------------
INSERT INTO `paper_question_option` VALUES (1, 1, 'A', '\\(2x\\)', 1, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question_option` VALUES (2, 1, 'B', '\\(x\\)', 2, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question_option` VALUES (3, 1, 'C', '\\(x^2\\)', 3, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question_option` VALUES (4, 1, 'D', '\\(2\\)', 4, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `paper_question_option` VALUES (2050115155365044225, 2050115155235020802, 'A', '\\(2x\\)', 1, '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question_option` VALUES (2050115155432153090, 2050115155235020802, 'B', '\\(x\\)', 2, '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question_option` VALUES (2050115155432153091, 2050115155235020802, 'C', '\\(x^2\\)', 3, '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question_option` VALUES (2050115155432153092, 2050115155235020802, 'D', '\\(2\\)', 4, '2026-05-01 15:28:37', '2026-05-01 15:28:37', 0);
INSERT INTO `paper_question_option` VALUES (2050115169629872130, 2050115169562763266, 'A', '\\(2x\\)', 1, '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question_option` VALUES (2050115169629872131, 2050115169562763266, 'B', '\\(x\\)', 2, '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question_option` VALUES (2050115169629872132, 2050115169562763266, 'C', '\\(x^2\\)', 3, '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);
INSERT INTO `paper_question_option` VALUES (2050115169629872133, 2050115169562763266, 'D', '\\(2\\)', 4, '2026-05-01 15:28:40', '2026-05-01 15:28:40', 0);

-- ----------------------------
-- Table structure for paper_rule
-- ----------------------------
DROP TABLE IF EXISTS `paper_rule`;
CREATE TABLE `paper_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ruleCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则编码',
  `ruleName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `paperType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'homework' COMMENT '试卷类型：homework、quiz、practice',
  `questionCount` int NOT NULL DEFAULT 0 COMMENT '目标题量',
  `totalScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '目标总分',
  `targetDifficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '目标难度',
  `ruleConfig` json NOT NULL COMMENT '组卷规则json，包含知识点、题型、数量、难度区间',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_ruleCode_isDelete`(`ruleCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '组卷规则表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of paper_rule
-- ----------------------------
INSERT INTO `paper_rule` VALUES (1, 'RULE_AUTO_MATH_001', '高二数学自动组卷规则-微积分综合', 'math', 'senior_high', 'grade_11', 'homework', 8, 70.00, 0.45, '{\"sections\": [{\"count\": 1, \"score\": 5, \"sectionName\": \"一、选择题\", \"questionType\": \"single_choice\", \"knowledgePointCodes\": [\"KP_DERIVATIVE\", \"KP_FUNCTION\"]}, {\"count\": 1, \"score\": 5, \"sectionName\": \"二、填空题\", \"questionType\": \"fill_blank\", \"knowledgePointCodes\": [\"KP_FUNCTION\"]}, {\"count\": 6, \"score\": 10, \"sectionName\": \"三、计算题\", \"questionType\": \"calculation\", \"knowledgePointCodes\": [\"KP_LIMIT\", \"KP_DERIVATIVE\", \"KP_INTEGRAL\", \"KP_EQUATION\"]}], \"strategy\": \"difficulty_balanced\", \"avoidRepeatDays\": 7, \"difficultyRange\": [0.2, 0.8]}', 1, '可按题型、知识点、难度自动抽题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题目编码',
  `templateId` bigint NULL DEFAULT NULL COMMENT '来源模板id',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型：single_choice、multiple_choice、fill_blank、calculation',
  `inputType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text' COMMENT '作答方式：choice、text、formula',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度系数，0.00-1.00',
  `sourceType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '来源：manual、import、template_generate、ai_generate',
  `stemContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干内容，包含数学式时直接存latex',
  `answerContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案展示内容，包含数学式时直接存latex',
  `answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'latex' COMMENT '答案值类型：统一为latex',
  `answerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案判题值，按字符串相等比对',
  `answerExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '标准答案表达式，供symja判等',
  `analysisContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析内容，包含数学式时直接存latex',
  `judgeMode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'exact_match' COMMENT '判题方式：exact_match',
  `blankCount` int NOT NULL DEFAULT 0 COMMENT '填空数量',
  `defaultScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '默认分值',
  `estimatedMinutes` int NOT NULL DEFAULT 3 COMMENT '预计作答时长，分钟',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionCode_isDelete`(`questionCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_templateId`(`templateId` ASC) USING BTREE,
  INDEX `idx_subjectCode_schoolStage_gradeLevel`(`subjectCode` ASC, `schoolStage` ASC, `gradeLevel` ASC) USING BTREE,
  INDEX `idx_questionType_difficulty`(`questionType` ASC, `difficulty` ASC) USING BTREE,
  CONSTRAINT `fk_question_templateId` FOREIGN KEY (`templateId`) REFERENCES `question_template` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050157677399318531 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题库主表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of question
-- ----------------------------
INSERT INTO `question` VALUES (1, 'Q_LIMIT_001', 1, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '计算极限：\\(\\lim_{x \\to 0}\\frac{\\sin x}{x}\\)', '\\(1\\)', 'latex', '1', NULL, '重要极限，答案为 1。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (2, 'Q_LIMIT_002', 1, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.50, 'manual', '计算极限：\\(\\lim_{n \\to \\infty}(1+\\frac{1}{n})^n\\)', '\\(e\\)', 'latex', 'e', NULL, '自然常数 e 的经典定义。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (3, 'Q_LIMIT_003', 1, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.55, 'manual', '计算极限：\\(\\lim_{x \\to 0}\\frac{1-\\cos x}{x^2}\\)', '\\(\\frac{1}{2}\\)', 'latex', '\\frac{1}{2}', NULL, '等价无穷小。', 'exact_match', 0, 10.00, 4, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (4, 'Q_DERIVATIVE_001', 2, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.30, 'manual', '求导：\\(\\frac{d}{dx}x^3\\)', '\\(3x^2\\)', 'latex', '3x^2', NULL, '幂函数求导。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (5, 'Q_DERIVATIVE_002', 2, 'calculation', 'latex', 'math', 'senior_high', 'grade_11', 0.45, 'manual', '求二阶导数：\\(\\frac{d^2}{dx^2}\\sin x\\)', '\\(-\\sin(x)\\)', 'latex', '-\\sin(x)', NULL, '先求一阶，再求二阶。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (6, 'Q_INTEGRAL_001', 3, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.40, 'manual', '计算定积分：\\(\\int_0^1 x^2\\,dx\\)', '\\(\\frac{1}{3}\\)', 'latex', '\\frac{1}{3}', NULL, '原函数为 x^3/3。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (7, 'Q_INTEGRAL_002', 3, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.75, 'manual', '计算广义积分：\\(\\int_0^{\\infty}e^{-x^2}\\,dx\\)', '\\(\\frac{\\sqrt{\\pi}}{2}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', NULL, '高斯积分半区间。', 'exact_match', 0, 10.00, 5, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (8, 'Q_INTEGRAL_003', 3, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '计算不定积分：\\(\\int 2x\\,dx\\)', '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, '原函数加常数 C。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (9, 'Q_EQUATION_001', 4, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.35, 'manual', '解方程：\\(x^2=1\\)', '\\(x=-1\\ 或\\ x=1\\)', 'latex', 'x=-1或x=1', NULL, '因式分解。', 'exact_match', 0, 10.00, 3, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (10, 'Q_EQUATION_002', 4, 'calculation', 'formula', 'math', 'senior_high', 'grade_11', 0.25, 'manual', '解方程：\\(2x+3=7\\)', '\\(x=2\\)', 'latex', '2', NULL, '移项求解。', 'exact_match', 0, 10.00, 2, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (11, 'Q_FILL_001', NULL, 'fill_blank', 'formula', 'math', 'senior_high', 'grade_11', 0.20, 'manual', '填空：\\(\\sqrt{16}=\\underline{\\quad}\\)', '\\(4\\)', 'latex', '4', NULL, '4 的平方是 16。', 'exact_match', 1, 5.00, 1, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (12, 'Q_CHOICE_001', 5, 'single_choice', 'choice', 'math', 'senior_high', 'grade_11', 0.20, 'manual', '单选：函数 \\(y=x^2\\) 的导数是？', 'A', 'latex', 'A', NULL, '导数为 2x。', 'exact_match', 0, 5.00, 1, 1, '自动组卷题', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question` VALUES (2050157677399318530, 'Q_1777630655037', NULL, 'calculation', 'latex', 'math', 'senior_high', 'grade_11', 0.50, 'manual', '计算：\\(\\int_0^{-\\infin} e^x\\,dx\\)', '\\(-1\\)', 'latex', '-1', NULL, '原函数为 \\(\\frac{x^3}{3}\\)，代入上下限得到 \\(\\frac{1}{3}\\)。', 'exact_match', 0, 10.00, 3, 1, NULL, '2026-05-01 18:17:35', '2026-05-01 18:17:35', 0);

-- ----------------------------
-- Table structure for question_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `question_knowledge`;
CREATE TABLE `question_knowledge`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionId` bigint NOT NULL COMMENT '题目id',
  `knowledgePointId` bigint NOT NULL COMMENT '知识点id',
  `weight` decimal(5, 2) NOT NULL DEFAULT 1.00 COMMENT '知识点权重',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionId_knowledgePointId_isDelete`(`questionId` ASC, `knowledgePointId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  CONSTRAINT `fk_question_knowledge_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_question_knowledge_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050157677470621698 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目知识点关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of question_knowledge
-- ----------------------------
INSERT INTO `question_knowledge` VALUES (1, 1, 3, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (2, 2, 3, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (3, 3, 3, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (4, 12, 4, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (5, 4, 4, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (6, 5, 4, 1.00, '2026-04-30 12:23:27', '2026-05-01 17:29:28', 1);
INSERT INTO `question_knowledge` VALUES (7, 6, 5, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (8, 7, 5, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (9, 8, 5, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (10, 9, 6, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (11, 10, 6, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (13, 11, 7, 1.00, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_knowledge` VALUES (2050145569223839745, 5, 4, 1.00, '2026-05-01 17:29:28', '2026-05-01 17:29:28', 0);
INSERT INTO `question_knowledge` VALUES (2050157677470621697, 2050157677399318530, 5, 1.00, '2026-05-01 18:17:35', '2026-05-01 18:17:35', 0);

-- ----------------------------
-- Table structure for question_option
-- ----------------------------
DROP TABLE IF EXISTS `question_option`;
CREATE TABLE `question_option`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `questionId` bigint NOT NULL COMMENT '题目id',
  `optionKey` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项键，如a、b、c、d',
  `optionContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '选项内容，包含数学式时直接存latex',
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确答案',
  `sortNo` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questionId_optionKey_isDelete`(`questionId` ASC, `optionKey` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  CONSTRAINT `fk_question_option_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目选项表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of question_option
-- ----------------------------
INSERT INTO `question_option` VALUES (1, 12, 'A', '\\(2x\\)', 1, 1, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_option` VALUES (2, 12, 'B', '\\(x\\)', 0, 2, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_option` VALUES (3, 12, 'C', '\\(x^2\\)', 0, 3, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_option` VALUES (4, 12, 'D', '\\(2\\)', 0, 4, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);

-- ----------------------------
-- Table structure for question_template
-- ----------------------------
DROP TABLE IF EXISTS `question_template`;
CREATE TABLE `question_template`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `templateCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板编码',
  `templateName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `questionType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题型：single_choice、fill_blank、calculation',
  `subjectCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'math' COMMENT '学科编码',
  `schoolStage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学段',
  `gradeLevel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '年级',
  `knowledgePointId` bigint NOT NULL COMMENT '所属知识点id',
  `difficulty` decimal(4, 2) NOT NULL DEFAULT 0.50 COMMENT '难度系数，0.00-1.00',
  `stemTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '题干模板，公式内容使用latex',
  `answerTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案模板，公式内容使用latex',
  `answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'latex' COMMENT '答案值类型：统一为latex',
  `answerValueTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案判题值模板，按字符串相等比对',
  `answerExprTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '答案表达式模板，供symja判等',
  `analysisTemplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解析模板，公式内容使用latex',
  `variableConfig` json NULL COMMENT '模板变量配置',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_templateCode_isDelete`(`templateCode` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  INDEX `idx_questionType_difficulty`(`questionType` ASC, `difficulty` ASC) USING BTREE,
  CONSTRAINT `fk_question_template_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '题目模板表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of question_template
-- ----------------------------
INSERT INTO `question_template` VALUES (1, 'TPL_LIMIT_BASIC', '极限计算模板', 'calculation', 'math', 'senior_high', 'grade_11', 3, 0.45, '计算极限：\\(\\lim_{x \\to a} f(x)\\)', NULL, 'latex', NULL, NULL, '先代入或等价变形，再使用极限运算。', NULL, 1, '自动组卷可用模板', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_template` VALUES (2, 'TPL_DERIVATIVE_BASIC', '导数计算模板', 'calculation', 'math', 'senior_high', 'grade_11', 4, 0.40, '求函数导数：\\(\\frac{d}{dx} f(x)\\)', NULL, 'latex', NULL, NULL, '使用幂函数、复合函数、乘积法则等求导。', NULL, 1, '自动组卷可用模板', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_template` VALUES (3, 'TPL_INTEGRAL_BASIC', '积分计算模板', 'calculation', 'math', 'senior_high', 'grade_11', 5, 0.55, '计算积分：\\(\\int f(x)\\,dx\\)', NULL, 'latex', NULL, NULL, '识别积分类型，先化简再计算。', NULL, 1, '自动组卷可用模板', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_template` VALUES (4, 'TPL_EQUATION_BASIC', '方程求解模板', 'calculation', 'math', 'senior_high', 'grade_11', 6, 0.35, '解方程：\\(f(x)=0\\)', NULL, 'latex', NULL, NULL, '移项、因式分解或调用符号求解。', NULL, 1, '自动组卷可用模板', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `question_template` VALUES (5, 'TPL_CHOICE_BASIC', '选择题模板', 'single_choice', 'math', 'senior_high', 'grade_11', 7, 0.30, '选择正确答案。', NULL, 'latex', NULL, NULL, '比较选项与标准答案。', NULL, 1, '自动组卷可用模板', '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);

-- ----------------------------
-- Table structure for student_answer
-- ----------------------------
DROP TABLE IF EXISTS `student_answer`;
CREATE TABLE `student_answer`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `taskStudentId` bigint NOT NULL COMMENT '学生作业任务id',
  `paperQuestionId` bigint NOT NULL COMMENT '试卷题目id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `attemptNo` int NOT NULL DEFAULT 1 COMMENT '作答次数',
  `answerContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案内容，包含数学式时直接存latex',
  `answerValueType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'latex' COMMENT '学生答案值类型：统一为latex',
  `answerValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案判题值，按字符串相等比对',
  `answerExpr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '学生答案表达式，供symja判等',
  `judgeResult` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '判题结果：pending、correct、wrong、partial',
  `judgeScore` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '判题得分',
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否正确',
  `feedbackContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '批改反馈内容，包含数学式时直接存latex',
  `submitTime` datetime NULL DEFAULT NULL COMMENT '提交时间',
  `autoCorrectTime` datetime NULL DEFAULT NULL COMMENT '自动批改时间',
  `teacherReviewTime` datetime NULL DEFAULT NULL COMMENT '教师复核时间',
  `reviewerId` bigint NOT NULL DEFAULT 0 COMMENT '复核教师id',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_taskStudentId_paperQuestionId_attemptNo_isDelete`(`taskStudentId` ASC, `paperQuestionId` ASC, `attemptNo` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_studentId`(`studentId` ASC) USING BTREE,
  INDEX `fk_student_answer_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  CONSTRAINT `fk_student_answer_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_answer_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_answer_taskStudentId` FOREIGN KEY (`taskStudentId`) REFERENCES `homework_task_student` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050155276072198150 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生作答记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of student_answer
-- ----------------------------
INSERT INTO `student_answer` VALUES (1, 1, 3, 1, 2, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', 10.00, 1, '答案正确。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', NULL, 0, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `student_answer` VALUES (2, 1, 7, 7, 2, 1, '\\(\\sqrt{\\pi}\\)', 'latex', '\\sqrt{\\pi}', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{\\sqrt{\\pi}}{2}。', '2026-04-30 12:23:27', '2026-04-30 12:23:27', NULL, 0, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `student_answer` VALUES (2050142706296786945, 2050135397260693506, 2050115169562763266, 12, 4, 1, '\\(A\\)', 'latex', 'A', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706451976193, 2050135397260693506, 2050115169629872134, 11, 4, 1, '\\(4\\)', 'latex', '4', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706451976195, 2050135397260693506, 2050115169629872135, 5, 4, 1, '\\(-\\sin(x)\\)', 'latex', '-\\sin(x)', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 -\\sinx。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706493919236, 2050135397260693506, 2050115169629872136, 2, 4, 1, '\\(e\\)', 'latex', 'e', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706493919238, 2050135397260693506, 2050115169629872137, 6, 4, 1, '\\(\\frac13\\)', 'latex', '\\frac13', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{1}{3}。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706561028098, 2050135397260693506, 2050115169696980994, 1, 4, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706561028100, 2050135397260693506, 2050115169696980995, 3, 4, 1, '\\(\\frac12\\)', 'latex', '\\frac12', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{1}{2}。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050142706561028103, 2050135397260693506, 2050115169696980996, 8, 4, 1, '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:18:06', '2026-05-01 17:18:06', NULL, 0, '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `student_answer` VALUES (2050144676667559937, 3, 1, 12, 4, 1, '\\(A\\)', 'latex', 'A', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 17:25:55', '2026-05-01 17:25:55', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144676906635266, 3, 2, 11, 4, 1, '\\(4\\)', 'latex', '4', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 17:25:55', '2026-05-01 17:25:55', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144677133127681, 3, 3, 1, 4, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144677334454274, 3, 4, 4, 4, 1, '\\(3x^2\\)', 'latex', '3x^2', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144677602889730, 3, 5, 6, 4, 1, '\\(\\frac13\\)', 'latex', '\\frac13', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{1}{3}。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144678064263169, 3, 6, 9, 4, 1, '\\(\\lbrace1,-1\\rbrace.\\)', 'latex', '\\lbrace1,-1\\rbrace.', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 x=-1或x=1。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144678651465730, 3, 7, 7, 4, 1, '\\(\\frac{\\sqrt{\\pi}}{2}\\)', 'latex', '\\frac{\\sqrt{\\pi}}{2}', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050144678982815746, 3, 8, 2, 4, 1, '\\(e\\)', 'latex', 'e', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 17:25:56', '2026-05-01 17:25:56', NULL, 0, '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `student_answer` VALUES (2050155275917008898, 2050145817153343493, 2050115155235020802, 12, 4, 1, '\\(A\\)', 'latex', 'A', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 18:08:02', '2026-05-01 18:08:02', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155275937980419, 2050145817153343493, 2050115155432153093, 11, 4, 1, '\\(4\\)', 'latex', '4', NULL, 'correct', 5.00, 1, '答案正确。', '2026-05-01 18:08:02', '2026-05-01 18:08:02', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155275937980421, 2050145817153343493, 2050115155432153094, 5, 4, 1, '\\(-sinx4\\)', 'latex', '-sinx4', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 -sinx。', '2026-05-01 18:08:02', '2026-05-01 18:08:02', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155276005089283, 2050145817153343493, 2050115155432153095, 2, 4, 1, '\\(e\\)', 'latex', 'e', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 18:08:03', '2026-05-01 18:08:03', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155276005089285, 2050145817153343493, 2050115155499261954, 6, 4, 1, '\\(frac(1,3)\\)', 'latex', 'frac(1,3)', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 18:08:03', '2026-05-01 18:08:03', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155276072198145, 2050145817153343493, 2050115155511844865, 1, 4, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 18:08:03', '2026-05-01 18:08:03', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155276072198147, 2050145817153343493, 2050115155520233474, 3, 4, 1, '\\(frac(1,2)\\)', 'latex', 'frac(1,2)', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 18:08:03', '2026-05-01 18:08:03', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);
INSERT INTO `student_answer` VALUES (2050155276072198149, 2050145817153343493, 2050115155520233475, 8, 4, 1, '\\(x^2+C\\)', 'latex', 'x^2+C', NULL, 'correct', 10.00, 1, '答案正确。', '2026-05-01 18:08:03', '2026-05-01 18:08:03', NULL, 0, '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);

-- ----------------------------
-- Table structure for student_knowledge_mastery
-- ----------------------------
DROP TABLE IF EXISTS `student_knowledge_mastery`;
CREATE TABLE `student_knowledge_mastery`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `knowledgePointId` bigint NOT NULL COMMENT '知识点id',
  `masteryLevel` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '掌握度：0-100',
  `rightCount` int NOT NULL DEFAULT 0 COMMENT '答对次数',
  `wrongCount` int NOT NULL DEFAULT 0 COMMENT '答错次数',
  `partialCount` int NOT NULL DEFAULT 0 COMMENT '部分正确次数',
  `lastAnswerTime` datetime NULL DEFAULT NULL COMMENT '最近作答时间',
  `lastWrongTime` datetime NULL DEFAULT NULL COMMENT '最近答错时间',
  `masteryDetail` json NULL COMMENT '掌握度计算详情',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_studentId_knowledgePointId_isDelete`(`studentId` ASC, `knowledgePointId` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_knowledgePointId`(`knowledgePointId` ASC) USING BTREE,
  INDEX `idx_masteryLevel`(`masteryLevel` ASC) USING BTREE,
  CONSTRAINT `fk_student_knowledge_mastery_knowledgePointId` FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_point` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_student_knowledge_mastery_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生知识点掌握表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of student_knowledge_mastery
-- ----------------------------
INSERT INTO `student_knowledge_mastery` VALUES (1, 2, 3, 80.00, 4, 1, 0, '2026-04-30 12:23:27', '2026-04-28 12:23:27', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `student_knowledge_mastery` VALUES (2, 2, 4, 90.00, 5, 0, 0, '2026-04-30 12:23:27', NULL, NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `student_knowledge_mastery` VALUES (3, 2, 5, 60.00, 2, 2, 0, '2026-04-30 12:23:27', '2026-04-30 12:23:27', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `student_knowledge_mastery` VALUES (4, 2, 6, 70.00, 3, 1, 0, '2026-04-30 12:23:27', '2026-04-29 12:23:27', NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);

-- ----------------------------
-- Table structure for user_account
-- ----------------------------
DROP TABLE IF EXISTS `user_account`;
CREATE TABLE `user_account`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录账号',
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `roleType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色：admin、teacher、student',
  `realName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1启用 0停用',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username_isDelete`(`username` ASC, `isDelete` ASC) USING BTREE,
  INDEX `idx_roleType`(`roleType` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2049803070055718914 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户账号表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_account
-- ----------------------------
INSERT INTO `user_account` VALUES (1, 'teacher_math_01', '0b65b55bb11b3a5ae4ad74f8502408d8', 'teacher', '张老师', NULL, NULL, 1, '2026-04-30 12:23:07', '2026-04-30 12:23:07', 0);
INSERT INTO `user_account` VALUES (2, 'student_zhangsan', '0b65b55bb11b3a5ae4ad74f8502408d8', 'student', '张三', NULL, NULL, 1, '2026-04-30 12:23:07', '2026-05-01 16:56:53', 0);
INSERT INTO `user_account` VALUES (3, 'student_lisi', '0b65b55bb11b3a5ae4ad74f8502408d8', 'student', '李四', NULL, NULL, 1, '2026-04-30 12:23:07', '2026-05-01 16:56:53', 0);
INSERT INTO `user_account` VALUES (4, 'student_wangwu', '0b65b55bb11b3a5ae4ad74f8502408d8', 'student', '王五', NULL, NULL, 1, '2026-04-30 12:23:07', '2026-05-01 16:56:53', 0);
INSERT INTO `user_account` VALUES (2049803070055718913, 'Truth', '0b65b55bb11b3a5ae4ad74f8502408d8', 'teacher', '123', NULL, NULL, 1, '2026-04-30 18:48:30', '2026-05-01 15:28:11', 0);

-- ----------------------------
-- Table structure for wrong_question_book
-- ----------------------------
DROP TABLE IF EXISTS `wrong_question_book`;
CREATE TABLE `wrong_question_book`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `studentId` bigint NOT NULL COMMENT '学生id',
  `questionId` bigint NULL DEFAULT NULL COMMENT '题库题目id',
  `paperQuestionId` bigint NULL DEFAULT NULL COMMENT '试卷题目id',
  `studentAnswerId` bigint NULL DEFAULT NULL COMMENT '来源作答记录id',
  `wrongReason` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '错因：concept、calculation、format、careless、unknown',
  `wrongSnapshot` json NULL COMMENT '错题快照：题干、学生答案、标准答案、解析等',
  `reviewCount` int NOT NULL DEFAULT 0 COMMENT '复习次数',
  `mastered` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已掌握',
  `lastReviewTime` datetime NULL DEFAULT NULL COMMENT '最近复习时间',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_studentId_mastered`(`studentId` ASC, `mastered` ASC) USING BTREE,
  INDEX `idx_questionId`(`questionId` ASC) USING BTREE,
  INDEX `idx_paperQuestionId`(`paperQuestionId` ASC) USING BTREE,
  INDEX `idx_studentAnswerId`(`studentAnswerId` ASC) USING BTREE,
  CONSTRAINT `fk_wrong_question_book_paperQuestionId` FOREIGN KEY (`paperQuestionId`) REFERENCES `paper_question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_questionId` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_studentAnswerId` FOREIGN KEY (`studentAnswerId`) REFERENCES `student_answer` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wrong_question_book_studentId` FOREIGN KEY (`studentId`) REFERENCES `user_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2050155276005089283 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生错题本表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of wrong_question_book
-- ----------------------------
INSERT INTO `wrong_question_book` VALUES (1, 2, 7, 7, 2, 'concept', NULL, 0, 0, NULL, '2026-04-30 12:23:27', '2026-04-30 12:23:27', 0);
INSERT INTO `wrong_question_book` VALUES (2050142706493919235, 4, 5, 2050115169629872135, 2050142706451976195, 'exact_match', NULL, 1, 1, '2026-05-01 18:08:48', '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `wrong_question_book` VALUES (2050142706493919240, 4, 6, 2050115169629872137, 2050142706493919238, 'exact_match', NULL, 1, 1, '2026-05-01 18:08:48', '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `wrong_question_book` VALUES (2050142706561028102, 4, 3, 2050115169696980995, 2050142706561028100, 'exact_match', NULL, 1, 1, '2026-05-01 18:08:49', '2026-05-01 17:18:05', '2026-05-01 17:18:05', 0);
INSERT INTO `wrong_question_book` VALUES (2050144677804216322, 4, 6, 5, 2050144677602889730, 'exact_match', NULL, 1, 1, '2026-05-01 18:08:47', '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `wrong_question_book` VALUES (2050144678458527746, 4, 9, 6, 2050144678064263169, 'exact_match', NULL, 1, 1, '2026-05-01 18:08:48', '2026-05-01 17:25:55', '2026-05-01 17:25:55', 0);
INSERT INTO `wrong_question_book` VALUES (2050155276005089282, 4, 5, 2050115155432153094, 2050155275937980421, 'exact_match', NULL, 5, 1, '2026-05-01 18:08:53', '2026-05-01 18:08:02', '2026-05-01 18:08:02', 0);

SET FOREIGN_KEY_CHECKS = 1;
