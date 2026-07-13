package com.zsecurity.demo.services;
import com.zsecurity.demo.entity.*;
import com.zsecurity.demo.enums.Roles;
import com.zsecurity.demo.exceptions.*;
import com.zsecurity.demo.repositories.UserRepo;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.Email;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class Services {

    @Autowired
    UserRepo userRepo;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtService jwtService;

    @Autowired
    EmailService emailService;


    public Users register(Users users) throws UserAlreadyExistsWithEmail {

        Users users1 = userRepo.findByEmail(users.getEmail()).orElse(null);
        if(users1 == null) {
            users.setRoles(Roles.USER);

            users.setPasswords(passwordEncoder.encode(users.getPassword()));
            users.setOtpVerificationTime(null);
            users.setOtp(null);

            emailService.emailGenerate(users);
            System.out.println(users);
            return userRepo.save(users);
        }else {
            throw new UserAlreadyExistsWithEmail("User with email "+users1.getEmail()+" is already Exists");
        }
    }

    public UserDTO logIn(Users users, HttpServletResponse response) {
         log.info("{}",users);

        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(users.getUsername(),users.getPassword()));


               Boolean b = authentication.isAuthenticated();
               log.info("{}",b);
                String token = jwtService.generateToken(users);
                Cookie cookie = new Cookie("jwtToken",token);
                cookie.setHttpOnly(true);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(10 * 60);
                response.addCookie(cookie);

                String refToken = jwtService.generateRefreshToken(users);
                Cookie cookie2 = new Cookie("refToken",refToken);
                cookie2.setHttpOnly(true);
                cookie2.setSecure(false);
                cookie2.setPath("/");
                cookie2.setMaxAge(2592000);
                response.addCookie(cookie2);
                Users users1 = userRepo.findByEmail(users.getEmail()).orElseThrow();

                return UserDTO.builder().email(users1.getEmail()).firstName(users1.getFirstName()).id(users1.getId()).build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Email or Password Incorrect");
        }
    }

    String email = "";

    @Transactional
    public String forgetPassword(AppRequest appRequest) {
        String email = appRequest.getEmail();

        Users users = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));


        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(5);


        if (users.getOtp() != null) {
            users.setOtp(null);
            users.setOtpVerificationTime(null);
        }


        users.setOtp(otp);
        users.setOtpVerificationTime(expirationTime);

        try {
            emailService.emailToReset(users, otp);
            userRepo.save(users);
            return "OTP sent successfully";
        } catch (Exception e) {

            throw new RuntimeException("Failed to process forget password request", e);
        }
    }


    public String ResetPassword(ResetOtp resetOtp) throws Exception {

        Users users = userRepo.findByEmail(resetOtp.getEmail()).orElseThrow(()->new UsernameNotFoundException("Wrong Credentials"));
        if(!users.getOtp().equals(resetOtp.getOtp())){
             throw new InvalidOtpException("Invalid! OTP");
        }

        if( users.getOtpVerificationTime().isBefore(LocalDateTime.now())){
            throw new InvalidOtpExpired("OTP Expired");
        }
        if(!resetOtp.getNewPassword().equals(resetOtp.getConfirmPassword())){
            throw new Exception("Passwords doesn't match");
        }
            users.setOtp(null);
            users.setOtpVerificationTime(null);
            users.setPasswords(passwordEncoder.encode(resetOtp.getNewPassword()));
            userRepo.save(users);
            emailService.resetSuccessfulMessage(users.getEmail());
            return "Password reset successful!";


    }


    public String refreshToken(HttpServletRequest request,HttpServletResponse response) {
        Cookie cookie1 = Arrays.stream(request.getCookies()).filter(cookie -> "jwtToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);

        Cookie cookie2 = Arrays.stream(request.getCookies()).filter(cookie -> "refToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);

        if(cookie1 != null){
            cookie1.setValue("");
            cookie1.setPath("/");
            cookie1.setHttpOnly(true);
            cookie1.setMaxAge(0);
        }
        if(cookie2 != null) {
            String token = cookie2.getValue();
            String email = jwtService.getEmailByToken(token);
            Users users = userRepo.findByEmail(email).orElseThrow();
            String newToken = jwtService.generateToken(users);
            Cookie cookie = new Cookie("jwtToken", newToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(10 * 60);
            response.addCookie(cookie);


            cookie2.setValue("");
            cookie2.setPath("/");
            cookie2.setHttpOnly(true);
            cookie2.setMaxAge(0);
           // response.addCookie(cookie2);

            String refToken = jwtService.generateRefreshToken(users);
            Cookie cookie3 = new Cookie("refToken",refToken);
            cookie3.setHttpOnly(true);
            cookie3.setSecure(false);
            cookie3.setPath("/");
            cookie3.setMaxAge(2592000);
            response.addCookie(cookie3);
        }


        return "";
    }



    public String logOutcont(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie1 = Arrays.stream(request.getCookies()).filter(cookie -> "refToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);

        Cookie cookie2 = Arrays.stream(request.getCookies()).filter(cookie -> "jwtToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);

        assert cookie1 != null;
        cookie1.setValue("");
        cookie1.setPath("/");
        cookie1.setHttpOnly(true);
        cookie1.setMaxAge(0);
        cookie2.setValue("");
        cookie2.setPath("/");
        cookie2.setHttpOnly(true);
        cookie2.setMaxAge(0);
        response.addCookie(cookie1);
        response.addCookie(cookie2);
        return "Logged out SucessFully";
    }

    public String changePasswords(ChangePassword changePassword) throws IncorrectOldPasswordException {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        Users users1 = userRepo.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException("user not found"));
        if (users1 != null && passwordEncoder.matches(changePassword.getOldPassword(),users1.getPasswords())) {
            users1.setPasswords(passwordEncoder.encode(changePassword.getNewPassword()));
            userRepo.save(users1);
            return "Password Changed Successfully";
        }
        else {
            throw new IncorrectOldPasswordException("Mismatch in passwords");
        }

    }


    public void updateProfile(UserDTO userDTO, @Email(message = "Please enter valid email") String email) {
        Users users = userRepo.findByEmail(email).orElse(null);
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setSkipNullEnabled(true);

        System.out.println(userDTO);
        userDTO.setId(users.getId());
        mapper.map(userDTO,users);
        assert users != null;
        userRepo.save(users);

    }

    public List<Users> getAllUSer() {
        return userRepo.findAll();
    }


    public void deactivateUSer(long id) {
       Users users = userRepo.findById(id).orElse(null);
        assert users != null;
        userRepo.save(users);
    }

    public void deleteUser(long id) {
        userRepo.deleteById(id);
    }

    public Users getUserByID(long id) {
        return userRepo.findById(id).orElseThrow();
    }

    public GetAllUserOverview getAllUserOverview() {
        List<Users> usersList = userRepo.findAll();
        return GetAllUserOverview.builder()
                .activeUser(usersList.size())
                .totalUser(usersList.size())
                .dailySignup(usersList.size())
                .build();
    }
}
