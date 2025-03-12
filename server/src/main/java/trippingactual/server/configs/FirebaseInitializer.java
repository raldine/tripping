// package trippingactual.server.configs;

// import java.io.FileInputStream;
// import java.io.IOException;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// import com.google.auth.oauth2.GoogleCredentials;
// import com.google.firebase.FirebaseApp;
// import com.google.firebase.FirebaseOptions;

// @Configuration
// public class FirebaseInitializer {

//     @Bean
//     public FirebaseApp initializeFirebase() throws IOException {

//         FileInputStream serviceAccount = new FileInputStream(
//                 "src/main/resources/tripping-b41ab-firebase-adminsdk-fbsvc-a809afea34.json");

//         FirebaseOptions options = FirebaseOptions.builder()
//                 .setCredentials(GoogleCredentials.fromStream(serviceAccount))
//                 .build();

//         if (FirebaseApp.getApps().isEmpty()) {
//             return FirebaseApp.initializeApp(options);
//         } else {
//             return FirebaseApp.getInstance();
//         }

//     }

// }
