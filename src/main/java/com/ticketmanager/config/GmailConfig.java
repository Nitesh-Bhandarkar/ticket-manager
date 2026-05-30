package com.ticketmanager.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.List;

@Configuration
public class GmailConfig {

    @Value("${gmail.credentials-path}")
    private String credentialsPath;

    @Bean
    @ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")
    public Gmail gmailClient() throws IOException, GeneralSecurityException {
        if (!Files.exists(Paths.get(credentialsPath))) {
            throw new IllegalStateException(
                "Gmail credentials file not found: " + credentialsPath +
                ". Download it from Google Cloud Console and set gmail.credentials-path."
            );
        }
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(credentialsPath))
                .createScoped(List.of(
                        GmailScopes.GMAIL_READONLY,
                        GmailScopes.GMAIL_SEND,
                        GmailScopes.GMAIL_MODIFY
                ));

        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials)
        ).setApplicationName("ticket-manager").build();
    }
}
