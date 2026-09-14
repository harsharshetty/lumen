package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {
    private final LoginIdentityRepository loginIdentityRepository;
    private final UserRepository userRepository;

    @Transactional
    public User resolveOrProvision(IdentityProvider provider, String providerSubject, String displayName) {
        return loginIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject)
                .map(LoginIdentity::getUser)
                .orElseGet(() -> provision(provider, providerSubject, displayName));
    }

    private User provision(IdentityProvider provider, String providerSubject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, provider, providerSubject));
        return user;
    }
}
