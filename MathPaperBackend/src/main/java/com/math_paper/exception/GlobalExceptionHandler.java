package com.math_paper.exception;

import com.math_paper.common.ErrorCode;
import com.math_paper.common.RestUtil;
import com.math_paper.common.Result;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException exception) {
        return RestUtil.error(exception.getErrorCode(), exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getAllErrors().isEmpty()
                ? ErrorCode.PARAM_ERROR.getMessage()
                : exception.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return RestUtil.error(ErrorCode.PARAM_ERROR, message);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception exception) {
        return RestUtil.error(ErrorCode.SYSTEM_ERROR, exception.getMessage());
    }
}
