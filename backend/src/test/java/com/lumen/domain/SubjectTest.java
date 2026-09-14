package com.lumen.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SubjectTest {
    @Test
    void exposesAndUpdatesName() {
        Subject subject = new Subject("Mathematics");
        assertThat(subject.getId()).isNull();
        assertThat(subject.getName()).isEqualTo("Mathematics");
        subject.setName("Math");
        assertThat(subject.getName()).isEqualTo("Math");
    }

    @Test
    void supportsJpaConstructor() {
        Subject subject = new Subject();
        assertThat(subject.getId()).isNull();
        assertThat(subject.getName()).isNull();
    }
}
