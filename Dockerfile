FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
RUN mvn --batch-mode dependency:go-offline
COPY backend/src ./src
RUN mvn --batch-mode package -DskipTests

FROM eclipse-temurin:21-jre
RUN groupadd --system --gid 10001 lumen \
    && useradd --system --uid 10001 --gid lumen --home-dir /app --shell /usr/sbin/nologin lumen
WORKDIR /app
COPY --from=build --chown=lumen:lumen /workspace/target/*.jar app.jar
USER lumen:lumen
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
