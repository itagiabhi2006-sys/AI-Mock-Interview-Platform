package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRepo extends JpaRepository<Video,Long> {

    List<Video> findBySessionId(Long sessionId);

    boolean existsBySessionId(Long sessionId);

    List<Video> findByUserId(Long userId);
}
