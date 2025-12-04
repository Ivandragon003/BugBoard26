# Base image con JDK 21
FROM eclipse-temurin:21-jdk

# Cartella di lavoro nel container
WORKDIR /app

# Copia il jar del progetto nel container
COPY target/BugBoard26-0.0.1-SNAPSHOT.jar app.jar

# Esponi la porta predefinita di Spring Boot
EXPOSE 8080

# Comando per avviare l'applicazione
ENTRYPOINT ["java", "-jar", "app.jar"]
