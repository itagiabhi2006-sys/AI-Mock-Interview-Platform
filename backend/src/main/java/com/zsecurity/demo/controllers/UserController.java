package com.zsecurity.demo.controllers;
import com.zsecurity.demo.entity.*;
import com.zsecurity.demo.exceptions.IncorrectOldPasswordException;
import com.zsecurity.demo.exceptions.UserAlreadyExistsWithEmail;
import com.zsecurity.demo.services.TempTokenService;
import com.zsecurity.demo.services.ImageServices;
import com.zsecurity.demo.services.Services;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000",allowCredentials = "true")
public class UserController {

    @Autowired
    Services services;

    @Autowired
    ImageServices imageServices;

    @Autowired
    TempTokenService tempTokenService;



    @PostMapping("/reg")
    public ResponseEntity<Users> register(@Valid @RequestBody Users users) throws UserAlreadyExistsWithEmail {
        return ResponseEntity.ok(services.register(users));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> logIn(@Valid @RequestBody Users users, HttpServletResponse response){
        return ResponseEntity.ok(services.logIn(users,response));
    }

    @PostMapping("/forget-password")
    public ResponseEntity<String> forgetPassword(@Valid @RequestBody AppRequest appRequest){
        return ResponseEntity.ok(services.forgetPassword(appRequest));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetOtp resetOtp) throws Exception {
        return ResponseEntity.ok(services.ResetPassword(resetOtp));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO>  getCurrentUser(@AuthenticationPrincipal Users user) {
        UserDTO userDTO = UserDTO.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .imageURL(user.getImageLink())
                .gender(user.getGender())
                .dob(user.getDob())
                .lastName(user.getLastName())
                .roles(user.getRoles().name())
                .build();
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken(HttpServletRequest request,HttpServletResponse response){
        return ResponseEntity.ok(services.refreshToken(request,response));
    }

    @PostMapping("/logoutt")
    public ResponseEntity<String> logOutcont(HttpServletResponse response,HttpServletRequest request){
        return  ResponseEntity.ok(services.logOutcont(request,response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePasswords(@RequestBody ChangePassword changePassword) throws IncorrectOldPasswordException {
        return ResponseEntity.ok(services.changePasswords(changePassword));
    }

    @PostMapping("/upload")
    public String getImage(@RequestParam("file")MultipartFile file, @RequestParam("name") String name) throws IOException {
        return imageServices.getImageUrl(file,name);
    }

    @PostMapping("/change")
    public String changeImg(@RequestParam("file")MultipartFile file, @RequestParam("name") String name) throws IOException {
        return imageServices.changeImg(file,name);
    }

    @PostMapping("/remove")
    public void removeImage(@RequestParam("name") String name) throws IOException {
         imageServices.removeImage(name);
    }

    @PostMapping("/verify-temptoken")
    public UserDTO verifyJwt(@RequestParam("token") String token){
        return tempTokenService.verifyAndDeleteToken(token);
    }

    @PostMapping("/update-profile")
   // @PreAuthorize("Admin")
    public void updateProfile(@RequestBody UserDTO userDTO){
        Users users = (Users) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        services.updateProfile(userDTO,users.getEmail());
    }

//    @GetMapping("/api/admin/users")
//    public List<Users> getAllUser(){
//        return services.getAllUSer();
//    }
//
//    @GetMapping("/api/admin/analytics/overview")
//    public GetAllUserOverview getAllUserOverview(){
//        return services.getAllUserOverview();
//    }
//
//    @PutMapping("/api/admin/users/{id}/deactivate")
//    public void deactivateUSer(@PathVariable long id){
//         services.deactivateUSer(id);
//    }
//
//    @DeleteMapping("/api/admin/users/{id}")
//    public void deleteUser(@PathVariable long id){
//        services.deleteUser(id);
//    }
//
//    @GetMapping("/api/user/{id}")
//    public Users getUserByID(@PathVariable long id){
//        return services.getUserByID(id);
//    }


}
