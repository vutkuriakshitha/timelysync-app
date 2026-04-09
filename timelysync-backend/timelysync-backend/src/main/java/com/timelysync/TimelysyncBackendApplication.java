package com.timelysync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TimelysyncBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(TimelysyncBackendApplication.class, args);
        System.out.println("TimelySync Backend Application Started Successfully!");
    }
}
