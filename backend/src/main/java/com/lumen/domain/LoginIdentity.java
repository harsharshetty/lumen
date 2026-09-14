package com.lumen.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "login_identities", uniqueConstraints = @UniqueConstraint(name = "uq_login_identity_provider_subject", columnNames = {"provider", "provider_subject"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RequiredArgsConstructor
public class LoginIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @NonNull
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NonNull
    private IdentityProvider provider;

    @Column(name = "provider_subject", nullable = false)
    @NonNull
    private String providerSubject;

    @Column(name = "verified_email")
    private String verifiedEmail;
}
