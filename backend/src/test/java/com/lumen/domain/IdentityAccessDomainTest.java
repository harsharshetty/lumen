package com.lumen.domain;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class IdentityAccessDomainTest {

    @Test
    void userSupportsPlatformRoleLifecycle() {
        User user = new User("Parent", UserRole.USER);

        assertThat(user.getId()).isNull();
        assertThat(user.getDisplayName()).isEqualTo("Parent");
        assertThat(user.getPlatformRole()).isEqualTo(UserRole.USER);

        user.setDisplayName("Guardian");
        user.setPlatformRole(UserRole.ADMIN);

        assertThat(user.getDisplayName()).isEqualTo("Guardian");
        assertThat(user.getPlatformRole()).isEqualTo(UserRole.ADMIN);
        assertThat(UserRole.values()).containsExactly(UserRole.USER, UserRole.ADMIN);
    }

    @Test
    void userLearnerAccessKeepsIdentityFixedAndAllowsExplicitAccessLevelChange() {
        User user = new User("Parent", UserRole.USER);
        Learner learner = new Learner("Aarohi");
        UserLearnerAccess access = new UserLearnerAccess(
                user,
                learner,
                LearnerAccessLevel.OWNER
        );

        assertThat(access.getId()).isNull();
        assertThat(access.getUser()).isSameAs(user);
        assertThat(access.getLearner()).isSameAs(learner);
        assertThat(access.getAccessLevel()).isEqualTo(LearnerAccessLevel.OWNER);

        access.changeAccessLevel(LearnerAccessLevel.CONTRIBUTOR);

        assertThat(access.getUser()).isSameAs(user);
        assertThat(access.getLearner()).isSameAs(learner);
        assertThat(access.getAccessLevel()).isEqualTo(LearnerAccessLevel.CONTRIBUTOR);
        assertThat(Arrays.stream(UserLearnerAccess.class.getMethods()).map(Method::getName))
                .doesNotContain("setUser", "setLearner", "setAccessLevel");
        assertThat(LearnerAccessLevel.values()).containsExactly(
                LearnerAccessLevel.OWNER,
                LearnerAccessLevel.CONTRIBUTOR,
                LearnerAccessLevel.VIEWER
        );
    }

    @Test
    void protectedNoArgConstructorsSupportJpa() {
        User user = new User();
        UserLearnerAccess access = new UserLearnerAccess();

        assertThat(user.getId()).isNull();
        assertThat(user.getDisplayName()).isNull();
        assertThat(user.getPlatformRole()).isNull();
        assertThat(access.getId()).isNull();
        assertThat(access.getUser()).isNull();
        assertThat(access.getLearner()).isNull();
        assertThat(access.getAccessLevel()).isNull();
    }

    @Test
    void requiredDomainFieldsRejectNulls() {
        User user = new User("Parent", UserRole.USER);
        Learner learner = new Learner("Aarohi");

        assertThatThrownBy(() -> new User(null, UserRole.USER)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new User("Parent", null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new UserLearnerAccess(null, learner, LearnerAccessLevel.OWNER))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new UserLearnerAccess(user, null, LearnerAccessLevel.OWNER))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new UserLearnerAccess(user, learner, null))
                .isInstanceOf(NullPointerException.class);
        UserLearnerAccess access = new UserLearnerAccess(user, learner, LearnerAccessLevel.OWNER);
        assertThatThrownBy(() -> access.changeAccessLevel(null)).isInstanceOf(NullPointerException.class);
    }
}
