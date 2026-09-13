# Backend architecture conventions

These conventions are mandatory for the Lumen backend unless explicitly changed by an approved architectural decision.

## Package layout

Under the root application package, keep these sibling packages:

```text
domain/
repository/
service/
controller/
config/
mappers/
dto/
```

### domain
All JPA/domain classes live here.

### repository
All Spring Data JPA repository interfaces live here.

### service
All service-level code must be coded to interfaces.

- Service interfaces live directly under `service/`.
- Every concrete service implementation lives under `service/impl/`.
- Controllers and other consumers depend on service interfaces, never on implementation classes directly.
- Concrete implementations use constructor injection.
- Transaction boundaries belong in the service implementation layer where appropriate.

Example:

```text
service/
  SubjectService.java
  CurriculumService.java
  LearnerService.java
  impl/
    SubjectServiceImpl.java
    CurriculumServiceImpl.java
    LearnerServiceImpl.java
```

### controller
All REST controllers live here.

### config
All Spring/application configuration classes live here.

### mappers
All mappings between DTOs and domain objects live here. Mapper implementation classes may be placed under `mappers/impl` when useful.

### dto
All request/response data transfer objects live here.

## API boundary rules

- Controllers expose DTOs only.
- JPA/domain entities must never be returned directly from controller endpoints.
- Incoming request DTOs are mapped to domain objects before persistence.
- Domain objects are mapped back to response DTOs before crossing the HTTP boundary.
- Controllers must not access repositories directly; they call service interfaces.
- Persistence concerns stay behind services/repositories.

## Package naming

Use lowercase Java package names, including `dto`, in accordance with Java conventions.
