package com.zsecurity.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ZsecurityApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZsecurityApplication.class, args);
	}

}
