package com.lumen.repository;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LoginIdentityRepository extends JpaRepository<LoginIdentity, UUID> {
    Optional<LoginIdentity> findByProviderAndProviderSubject(IdentityProvider provider, String providerSubject);
}
