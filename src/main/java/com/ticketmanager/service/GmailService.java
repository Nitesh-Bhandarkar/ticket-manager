package com.ticketmanager.service;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")
@RequiredArgsConstructor
public class GmailService {

    private final Gmail gmailClient;

    @Value("${gmail.target-inbox}")
    private String targetInbox;

    public List<Message> fetchUnreadMessages() {
        // TODO: query Gmail API for UNREAD messages in targetInbox label/inbox
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Message fetchMessageById(String messageId) {
        // TODO: fetch full message (format=FULL) from Gmail API
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public void sendReply(String threadId, String to, String subject, String body) {
        // TODO: construct MIME message, set In-Reply-To header, send via gmailClient.users().messages().send()
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public void markAsRead(String messageId) {
        // TODO: remove UNREAD label via gmailClient.users().messages().modify()
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
