package com.zsecurity.demo.services;

import com.zsecurity.demo.entity.Question;
import com.zsecurity.demo.repositories.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;

    public Question save(Question q) {
        return questionRepository.save(q);
    }

    public List<Question> saveAll(List<Question> questions) {
        return questionRepository.saveAll(questions);
    }

    public List<Question> getByDomain(String domain) {
        return questionRepository.findByDomain(domain);
    }

    public Optional<Question> findById(Long id) {
        return questionRepository.findById(id);
    }

    public List<Question> findAll() {
        return questionRepository.findAll();
    }

    public void deleteById(Long id) {
        questionRepository.deleteById(id);
    }
}