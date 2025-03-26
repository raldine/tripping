# # build angular
# FROM node:23 AS ng-build

# WORKDIR /src

# RUN npm i -g @angular/cli


# COPY client/public public
# COPY client/src src
# COPY client/*.json .

# RUN npm ci && ng build

#build spring boot
FROM openjdk:23-jdk AS j-build

WORKDIR /src

COPY server/.mvn .mvn
COPY server/src src
COPY server/mvnw .
COPY server/pom.xml .

# # copy angular files to static
# COPY --from=ng-build \
#         /src/dist/client/browser src/main/resources/static

RUN chmod a+x mvnw && ./mvnw package -Dmaven.test.skip=true

#copy jar file over
FROM openjdk:23-jdk

COPY --from=j-build \ 
        /src/target/server-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080

EXPOSE ${PORT}

SHELL [ "/bin/sh", "-c" ]
ENTRYPOINT SERVER_PORT=${PORT} java -jar app.jar