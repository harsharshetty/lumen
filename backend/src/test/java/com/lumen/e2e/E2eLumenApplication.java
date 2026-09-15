package com.lumen.e2e;

import com.lumen.LumenApplication;
import com.lumen.security.SecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootConfiguration
@EnableAutoConfiguration
@EntityScan(basePackages = "com.lumen.domain")
@EnableJpaRepositories(basePackages = "com.lumen.repository")
@ComponentScan(
        basePackages = "com.lumen",
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = LumenApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
        })
public class E2eLumenApplication {
    public static void main(String[] args) {
        SpringApplication.run(E2eLumenApplication.class, args);
    }
}
