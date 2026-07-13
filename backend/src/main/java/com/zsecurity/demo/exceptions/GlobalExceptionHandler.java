package com.zsecurity.demo.exceptions;

import com.zsecurity.demo.entity.ApiError;
import io.jsonwebtoken.JwtException;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> exception(BadCredentialsException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .message(msg.getMessage()).build();

        return ResponseEntity.status(401).body(apiError);
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ApiError> invalidOtpException(InvalidOtpException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.CONFLICT)
                .message(msg.getMessage()).build();

        return ResponseEntity.status(409).body(apiError);
    }

    @ExceptionHandler(InvalidOtpExpired.class)
    public ResponseEntity<ApiError> invalidOtpExpired(InvalidOtpExpired msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.CONFLICT)
                .message(msg.getMessage()).build();

        return ResponseEntity.status(409).body(apiError);
    }


    @ExceptionHandler(UserAlreadyExistsWithEmail.class)
    public ResponseEntity<ApiError> userAlreadyExistsWithEmail(UserAlreadyExistsWithEmail msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.BAD_REQUEST)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> authenticationException(AuthenticationException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.BAD_REQUEST)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiError> jtException(JwtException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.FORBIDDEN)
                .message(msg.getLocalizedMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> usernameNotFoundException(UsernameNotFoundException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }
    @ExceptionHandler(UserNotYetLoggedInException.class)
    public ResponseEntity<ApiError> userNotYseLoggedIn(UserNotYetLoggedInException msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> exception(MethodArgumentNotValidException
                                                          msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .message(msg.getBindingResult().getFieldError().getDefaultMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(IncorrectOldPasswordException.class)
    public ResponseEntity<ApiError> exception(IncorrectOldPasswordException
                                                      msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.FORBIDDEN)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> exception(Exception
                                                      msg){
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .message(msg.getMessage()).build();

        return ResponseEntity.badRequest().body(apiError);
    }


}
