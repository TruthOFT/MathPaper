package com.math_paper.service;

import com.math_paper.dto.StudentRequest;
import com.math_paper.dto.StudentResponse;

import java.util.List;

public interface StudentManagementService {
    List<StudentResponse> list(String keyword, Long classId);

    StudentResponse save(StudentRequest request);

    void delete(Long id);
}
