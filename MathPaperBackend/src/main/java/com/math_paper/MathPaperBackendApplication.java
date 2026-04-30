package com.math_paper;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.math_paper.mapper")
@SpringBootApplication
public class MathPaperBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MathPaperBackendApplication.class, args);
    }
}
