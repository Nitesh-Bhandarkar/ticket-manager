package com.ticketmanager.service;

import org.springframework.stereotype.Service;

@Service
public class AIResponseService {

    // TODO Phase 5: inject ChatClient.Builder (spring-ai-anthropic-spring-boot-starter)

    public String classifyCategory(String subject, String body) {
        // TODO Phase 5: prompt Claude with category list, return category name
        throw new UnsupportedOperationException("AI not yet implemented");
    }

    public String classifyPriority(String subject, String body) {
        // TODO Phase 5: prompt Claude to return HIGH / MEDIUM / LOW
        throw new UnsupportedOperationException("AI not yet implemented");
    }

    public String draftReply(String subject, String emailBody, String resolution) {
        // TODO Phase 5: prompt Claude to produce human-friendly reply using resolution as context
        throw new UnsupportedOperationException("AI not yet implemented");
    }
}
