package com.lumen.service;

import com.lumen.domain.Curriculum;
import com.lumen.domain.Subject;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.SubjectRepository;
import com.lumen.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurriculumCatalogService {
    private final CurriculumRepository curriculumRepository;
    private final SubjectRepository subjectRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public List<Curriculum> listActive() {
        return curriculumRepository.findAllByActiveTrue();
    }

    @Transactional
    public Curriculum create(OAuth2AuthenticationToken authentication, String name, String gradeLevel, UUID subjectId) {
        requireAdmin(authentication);
        Subject subject = requireSubject(subjectId);
        return curriculumRepository.save(new Curriculum(name, gradeLevel, subject));
    }

    @Transactional
    public Curriculum update(OAuth2AuthenticationToken authentication, UUID curriculumId,
                             String name, String gradeLevel, UUID subjectId) {
        requireAdmin(authentication);
        Curriculum curriculum = requireCurriculum(curriculumId);
        curriculum.setName(name);
        curriculum.setGradeLevel(gradeLevel);
        curriculum.setSubject(requireSubject(subjectId));
        return curriculumRepository.save(curriculum);
    }

    @Transactional
    public Curriculum setActive(OAuth2AuthenticationToken authentication, UUID curriculumId, boolean active) {
        requireAdmin(authentication);
        Curriculum curriculum = requireCurriculum(curriculumId);
        curriculum.setActive(active);
        return curriculumRepository.save(curriculum);
    }

    private void requireAdmin(OAuth2AuthenticationToken authentication) {
        User user = authenticatedUserService.currentUser(authentication);
        if (user.getPlatformRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("ADMIN role required");
        }
    }

    private Subject requireSubject(UUID subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));
    }

    private Curriculum requireCurriculum(UUID curriculumId) {
        return curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found"));
    }
}
