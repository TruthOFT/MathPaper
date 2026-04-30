/*
 当前版本不需要新增 passwordSalt 字段。
 密码规则：MD5(用户明文密码 + 项目固定 SALT 常量)。

 如果你之前已经执行过旧版 SQL，库里多了 passwordSalt 字段也不影响运行；
 后端实体不再映射这个字段。
*/

SET NAMES utf8mb4;
USE `math_paper`;

SELECT 'no schema change required' AS message;
