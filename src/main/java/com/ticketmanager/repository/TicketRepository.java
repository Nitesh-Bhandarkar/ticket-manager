package com.ticketmanager.repository;

import com.ticketmanager.enums.TicketStatus;
import com.ticketmanager.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByAssignedAgentId(UUID agentId);
    List<Ticket> findByStatus(TicketStatus status);
    Optional<Ticket> findByGmailThreadId(String gmailThreadId);
    Optional<Ticket> findByGmailMessageId(String gmailMessageId);
}
