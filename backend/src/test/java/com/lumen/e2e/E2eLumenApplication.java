package com.lumen.e2e;

import com.lumen.LumenApplication;
import org.springframework.boot.SpringApplication;

public final class E2eLumenApplication {
    private E2eLumenApplication() {
    }

    public static void main(String[] args) {
        new SpringApplication(LumenApplication.class, E2eSecurityConfiguration.class).run(args);
    }
}
