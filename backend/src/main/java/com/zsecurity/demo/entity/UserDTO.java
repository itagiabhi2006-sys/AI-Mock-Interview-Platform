package com.zsecurity.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private long id;
    private String firstName;
    private String email;
    private String imageURL;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String roles;
}
