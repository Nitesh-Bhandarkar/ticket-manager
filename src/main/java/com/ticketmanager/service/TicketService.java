package com.ticketmanager.service;

import com.ticketmanager.enums.TicketPriority;
import com.ticketmanager.enums.TicketStatus;
import com.ticketmanager.model.Ticket;
import com.ticketmanager.model.User;
import com.ticketmanager.repository.TicketRepository;
import com.ticketmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SLAService slaService;

    @Transactional
    public Ticket createTicket(String subject, String body, String emailFrom,
                               String gmailMessageId, String gmailThreadId,
                               String category, TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        Ticket ticket = Ticket.builder()
                .subject(subject)
                .body(body)
                .emailFrom(emailFrom)
                .gmailMessageId(gmailMessageId)
                .gmailThreadId(gmailThreadId)
                .category(category)
                .priority(priority)
                .status(TicketStatus.OPEN)
                .slaDeadline(slaService.calculateDeadline(priority, now))
                .build();
        return ticketRepository.save(ticket);
    }

    public Ticket getTicketById(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
    }

    public List<Ticket> getTicketsByAgent(UUID agentId) {
        return ticketRepository.findByAssignedAgentId(agentId);
    }

    public List<Ticket> getTicketsByAgentEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> ticketRepository.findByAssignedAgentId(user.getId()))
                .orElse(List.of());
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Transactional
    public Ticket updateStatus(UUID id, TicketStatus newStatus) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignToAgent(UUID ticketId, UUID agentId) {
        Ticket ticket = getTicketById(ticketId);
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        ticket.setAssignedAgent(agent);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket reopenTicket(UUID id) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(TicketStatus.REOPENED);
        ticket.setResolvedAt(null);
        return ticketRepository.save(ticket);
    }
}
