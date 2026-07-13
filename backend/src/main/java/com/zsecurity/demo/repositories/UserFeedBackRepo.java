package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFeedBackRepo extends JpaRepository<UserFeedback,Long> {
}
