package com.math_paper.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.math_paper.common.ErrorCode;
import com.math_paper.dto.StudentRequest;
import com.math_paper.dto.StudentResponse;
import com.math_paper.entity.ClassInfo;
import com.math_paper.entity.ClassStudent;
import com.math_paper.entity.UserAccount;
import com.math_paper.exception.BusinessException;
import com.math_paper.mapper.ClassInfoMapper;
import com.math_paper.mapper.ClassStudentMapper;
import com.math_paper.mapper.UserAccountMapper;
import com.math_paper.service.StudentManagementService;
import com.math_paper.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StudentManagementServiceImpl implements StudentManagementService {

    private final UserAccountMapper userAccountMapper;
    private final ClassInfoMapper classInfoMapper;
    private final ClassStudentMapper classStudentMapper;

    @Override
    public List<StudentResponse> list(String keyword, Long classId) {
        LambdaQueryWrapper<UserAccount> wrapper = new LambdaQueryWrapper<UserAccount>()
                .eq(UserAccount::getIsDelete, 0)
                .eq(UserAccount::getRoleType, "student")
                .orderByDesc(UserAccount::getCreateTime);
        if (!isBlank(keyword)) {
            String text = keyword.trim();
            wrapper.and(item -> item.like(UserAccount::getUsername, text).or().like(UserAccount::getRealName, text));
        }

        return userAccountMapper.selectList(wrapper).stream()
                .map(this::toResponse)
                .filter(item -> classId == null || Objects.equals(item.classId(), classId))
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public StudentResponse save(StudentRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.realName())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "账号和姓名不能为空");
        }

        UserAccount student = request.id() == null ? new UserAccount() : findStudent(request.id());
        String username = request.username().trim();
        Long sameUsernameCount = userAccountMapper.selectCount(new LambdaQueryWrapper<UserAccount>()
                .eq(UserAccount::getUsername, username)
                .eq(UserAccount::getIsDelete, 0)
                .ne(student.getId() != null, UserAccount::getId, student.getId()));
        if (sameUsernameCount > 0) {
            throw new BusinessException(ErrorCode.ACCOUNT_EXISTS);
        }

        if (student.getId() == null) {
            student.setPasswordHash(PasswordUtil.md5WithSalt(isBlank(request.password()) ? "123456" : request.password()));
            student.setRoleType("student");
            student.setIsDelete(0);
        } else if (!isBlank(request.password())) {
            student.setPasswordHash(PasswordUtil.md5WithSalt(request.password()));
        }
        student.setUsername(username);
        student.setRealName(request.realName().trim());
        student.setPhone(trimToNull(request.phone()));
        student.setEmail(trimToNull(request.email()));
        student.setStatus(request.status() == null ? 1 : request.status());

        if (student.getId() == null) {
            userAccountMapper.insert(student);
        } else {
            userAccountMapper.updateById(student);
        }

        replaceClassStudent(student.getId(), request.classId(), request.studentNo());
        return toResponse(student);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void delete(Long id) {
        UserAccount student = findStudent(id);
        student.setIsDelete(1);
        userAccountMapper.updateById(student);
        classStudentMapper.delete(new LambdaQueryWrapper<ClassStudent>().eq(ClassStudent::getStudentId, id));
    }

    private UserAccount findStudent(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "学生 id 不能为空");
        }
        UserAccount student = userAccountMapper.selectById(id);
        if (student == null || student.getIsDelete() != null && student.getIsDelete() == 1 || !"student".equals(student.getRoleType())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "学生不存在");
        }
        return student;
    }

    private void replaceClassStudent(Long studentId, Long classId, String studentNo) {
        classStudentMapper.delete(new LambdaQueryWrapper<ClassStudent>().eq(ClassStudent::getStudentId, studentId));
        if (classId == null) {
            return;
        }
        ClassInfo classInfo = classInfoMapper.selectById(classId);
        if (classInfo == null || classInfo.getIsDelete() != null && classInfo.getIsDelete() == 1) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "班级不存在");
        }
        ClassStudent item = new ClassStudent();
        item.setClassId(classId);
        item.setStudentId(studentId);
        item.setStudentNo(trimToNull(studentNo));
        item.setJoinTime(LocalDateTime.now());
        item.setStatus(1);
        item.setIsDelete(0);
        classStudentMapper.insert(item);
    }

    private StudentResponse toResponse(UserAccount student) {
        ClassStudent relation = classStudentMapper.selectList(new LambdaQueryWrapper<ClassStudent>()
                        .eq(ClassStudent::getStudentId, student.getId())
                        .eq(ClassStudent::getIsDelete, 0))
                .stream()
                .max(Comparator.comparing(ClassStudent::getJoinTime, Comparator.nullsLast(LocalDateTime::compareTo)))
                .orElse(null);
        ClassInfo classInfo = relation == null ? null : classInfoMapper.selectById(relation.getClassId());
        return new StudentResponse(
                student.getId(),
                student.getUsername(),
                student.getRealName(),
                student.getPhone(),
                student.getEmail(),
                student.getStatus(),
                relation == null ? null : relation.getClassId(),
                classInfo == null ? null : classInfo.getClassName(),
                relation == null ? null : relation.getStudentNo(),
                relation == null ? null : relation.getJoinTime(),
                student.getCreateTime(),
                student.getUpdateTime()
        );
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
