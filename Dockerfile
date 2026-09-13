FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
RUN mvn --batch-mode dependency:go-offline
COPY backend/src ./src
RUN mvn --batch-mode package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
