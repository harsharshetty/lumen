# Backend architecture conventions

These conventions are mandatory for the Lumen backend unless explicitly changed by an approved architectural decision.

## Package layout

Under the root application package, keep these sibling packages:

```text
domain/
repository/
service/
  impl/
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
- Every service implementation implements its corresponding service interface.
- Controllers and other consumers depend on service interfaces, never on implementation classes directly.
- Concrete implementations use constructor injection.
- Service methods should express application/use-case intent rather than mirror repository CRUD method names.

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

## Transaction boundaries

- `@Service` identifies the Spring service bean; it does not create a transaction.
- Put transaction boundaries at the service/use-case layer when an operation must be atomic across multiple repository/database actions.
- Use `@Transactional` deliberately on mutating use-case methods that need one transaction. Do not add transactions to simple reads or single-operation methods without a concrete need.
- Keep transactions short and database-focused. Do not perform external API calls, LLM calls, file processing, or other potentially slow I/O inside an open database transaction.
- Rely on Spring's default rollback behavior for unchecked exceptions. If a checked exception must trigger rollback, configure `rollbackFor` explicitly.

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
- Incoming request DTOs are mapped to domain/application inputs before the service call.
- Domain objects are mapped back to response DTOs before crossing the HTTP boundary.
- Services must not depend on HTTP request/response DTOs.
- Controllers must not access repositories directly; they call service interfaces.
- Persistence concerns stay behind services/repositories.

## Package naming

Use lowercase Java package names, including `dto`, in accordance with Java conventions.
