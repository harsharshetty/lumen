package com.lumen.repository;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("postgres")
@Transactional
class PostgresPersistenceIntegrationTest {

    @Autowired DataSource dataSource;
    @Autowired JdbcTemplate jdbc;

    @Test
    void flywayMigratesEmptyPostgresAndEnforcesIdentityAndAssociationConstraints() throws Exception {
        assertThatThrownBy(() -> {
            try (var connection = dataSource.getConnection()) {
                if (!"PostgreSQL".equals(connection.getMetaData().getDatabaseProductName())) {
                    throw new AssertionError("Persistence authority must be PostgreSQL");
                }
            }
            throw new IllegalStateException("PostgreSQL check unexpectedly continued");
        }).isInstanceOf(IllegalStateException.class);

        Integer migrations = jdbc.queryForObject(
                "select count(*) from flyway_schema_history where success = true", Integer.class);
        org.assertj.core.api.Assertions.assertThat(migrations).isGreaterThanOrEqualTo(5);

        UUID user = UUID.randomUUID();
        UUID secondUser = UUID.randomUUID();
        UUID learner = UUID.randomUUID();
        jdbc.update("insert into users(id, display_name, platform_role) values (?, ?, ?)", user, "Owner one", "USER");
        jdbc.update("insert into users(id, display_name, platform_role) values (?, ?, ?)", secondUser, "Owner two", "USER");
        jdbc.update("insert into learners(id, display_name) values (?, ?)", learner, "Learner");
        jdbc.update("insert into login_identities(id, user_id, provider, provider_subject) values (?, ?, ?, ?)",
                UUID.randomUUID(), user, "GOOGLE", "subject-1");

        assertThatThrownBy(() -> jdbc.update(
                "insert into login_identities(id, user_id, provider, provider_subject) values (?, ?, ?, ?)",
                UUID.randomUUID(), secondUser, "GOOGLE", "subject-1"))
                .isInstanceOf(DataIntegrityViolationException.class);

        jdbc.update("insert into user_learner_access(id, user_id, learner_id, access_level) values (?, ?, ?, ?)",
                UUID.randomUUID(), user, learner, "OWNER");
        jdbc.update("insert into user_learner_access(id, user_id, learner_id, access_level) values (?, ?, ?, ?)",
                UUID.randomUUID(), secondUser, learner, "OWNER");

        assertThatThrownBy(() -> jdbc.update(
                "insert into user_learner_access(id, user_id, learner_id, access_level) values (?, ?, ?, ?)",
                UUID.randomUUID(), user, learner, "VIEWER"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
