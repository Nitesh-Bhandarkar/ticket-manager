package com.ticketmanager.service;

import com.google.api.services.gmail.model.Message;
import com.ticketmanager.enums.TicketPriority;
import com.ticketmanager.enums.TicketStatus;
import com.ticketmanager.model.Ticket;
import com.ticketmanager.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class EmailPollingService {

    private static final double SIMILARITY_THRESHOLD = 0.80;

    private final GmailService gmailService;
    private final TicketService ticketService;
    private final AIResponseService aiResponseService;
    private final KnowledgeBaseService knowledgeBaseService;
    private final TicketRepository ticketRepository;

    public void pollAndProcess() {
        List<Message> unread = gmailService.fetchUnreadMessages();
        for (Message message : unread) {
            try {
                processMessage(message);
            } catch (Exception e) {
                log.error("Failed to process message {}", message.getId(), e);
            }
        }
    }

    private void processMessage(Message rawMessage) {
        Message message = gmailService.fetchMessageById(rawMessage.getId());

        // TODO: parse subject, body, sender, threadId from message payload/headers

        String subject = "";   // TODO: extract from headers
        String body    = "";   // TODO: extract from payload parts
        String from    = "";   // TODO: extract From header
        String threadId = message.getThreadId();

        // Reopen if a reply on an existing resolved/closed thread
        Optional<Ticket> existing = ticketRepository.findByGmailThreadId(threadId);
        if (existing.isPresent()) {
            Ticket ticket = existing.get();
            if (ticket.getStatus() == com.ticketmanager.enums.TicketStatus.RESOLVED
                    || ticket.getStatus() == com.ticketmanager.enums.TicketStatus.CLOSED) {
                ticketService.reopenTicket(ticket.getId());
                log.info("Reopened ticket {} for thread {}", ticket.getId(), threadId);
            }
            gmailService.markAsRead(message.getId());
            return;
        }

        String category = aiResponseService.classifyCategory(subject, body);
        TicketPriority priority = TicketPriority.valueOf(aiResponseService.classifyPriority(subject, body));

        Ticket ticket = ticketService.createTicket(subject, body, from, message.getId(), threadId, category, priority);
        log.info("Created ticket {} for message {}", ticket.getId(), message.getId());

        Optional<String> resolution = knowledgeBaseService.findBestResolution(subject + " " + body, SIMILARITY_THRESHOLD);

        if (resolution.isPresent()) {
            String draft = aiResponseService.draftReply(subject, body, resolution.get());
            gmailService.sendReply(threadId, from, "Re: " + subject, draft);
            ticketService.updateStatus(ticket.getId(), TicketStatus.RESOLVED);
            log.info("AI auto-replied and resolved ticket {}", ticket.getId());
        } else {
            // Low similarity or unknown category — leave as OPEN for agent assignment
            log.info("Ticket {} escalated to agent queue (no KB match)", ticket.getId());
        }

        gmailService.markAsRead(message.getId());
    }
}
