# Student Exchange Backend

Spring Boot backend for the Student Exchange platform.

## Prerequisites
- Java 17+ (Java 21 LTS recommended)
- MySQL 8.0

## Default DB Configuration
`src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/student_exchange?useUnicode=true&characterEncoding=utf8&connectionCollation=utf8mb4_vi_0900_ai_ci&connectionTimeZone=UTC&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=student_exchange_web
spring.datasource.password=wind_faculty
```

You can override these with environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## Run
```powershell
.\mvnw.cmd spring-boot:run
```

Base API: `http://localhost:8080/api`

## Notes
- `Ctrl+C` stops the app; Maven may print `BUILD FAILURE` / `exit code: 1` after manual termination.
- Running on Java 25 may show JDK compatibility warnings from Maven/Tomcat; Java 21 LTS is recommended.
- If startup fails with `Port 8080 was already in use`, run `netstat -ano | findstr :8080` then `taskkill /PID <PID> /F`.
