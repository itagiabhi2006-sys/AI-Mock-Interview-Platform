package com.zsecurity.demo.repositories;

import com.zsecurity.demo.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByActiveTrue();



}