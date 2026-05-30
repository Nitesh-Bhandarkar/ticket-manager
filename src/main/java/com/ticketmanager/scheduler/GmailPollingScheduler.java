package com.ticketmanager.scheduler;

import com.ticketmanager.service.EmailPollingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class GmailPollingScheduler {

    private final EmailPollingService emailPollingService;

    @Scheduled(fixedDelayString = "${scheduling.gmail-poll-interval-ms}")
    public void pollGmail() {
        log.info("Gmail polling started");
        emailPollingService.pollAndProcess();
        log.info("Gmail polling completed");
    }
}
