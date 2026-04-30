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

 Date: 30/04/2026 12:16:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '学生作答记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of student_answer
-- ----------------------------
INSERT INTO `student_answer` VALUES (1, 1, 3, 1, 2, 1, '\\(1\\)', 'latex', '1', NULL, 'correct', 10.00, 1, '答案正确。', '2026-04-30 12:11:55', '2026-04-30 12:11:55', NULL, 0, '2026-04-30 12:11:55', '2026-04-30 12:11:55', 0);
INSERT INTO `student_answer` VALUES (2, 1, 7, 7, 2, 1, '\\(\\sqrt{\\pi}\\)', 'latex', '\\sqrt{\\pi}', NULL, 'wrong', 0.00, 0, '字符串比对不一致，标准答案是 \\frac{\\sqrt{\\pi}}{2}。', '2026-04-30 12:11:55', '2026-04-30 12:11:55', NULL, 0, '2026-04-30 12:11:55', '2026-04-30 12:11:55', 0);

SET FOREIGN_KEY_CHECKS = 1;
