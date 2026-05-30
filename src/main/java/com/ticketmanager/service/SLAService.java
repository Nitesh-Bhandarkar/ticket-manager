package com.ticketmanager.service;

import com.ticketmanager.enums.TicketPriority;
import com.ticketmanager.model.Ticket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SLAService {

    @Value("${sla.high-priority-hours}")
    private int highPriorityHours;

    @Value("${sla.medium-priority-hours}")
    private int mediumPriorityHours;

    @Value("${sla.low-priority-hours}")
    private int lowPriorityHours;

    public LocalDateTime calculateDeadline(TicketPriority priority, LocalDateTime createdAt) {
        int hours = switch (priority) {
            case HIGH   -> highPriorityHours;
            case MEDIUM -> mediumPriorityHours;
            case LOW    -> lowPriorityHours;
        };
        return createdAt.plusHours(hours);
    }

    public boolean isBreached(Ticket ticket) {
        return ticket.getSlaDeadline() != null
                && ticket.getResolvedAt() == null
                && LocalDateTime.now().isAfter(ticket.getSlaDeadline());
    }

    public boolean isAtRisk(Ticket ticket) {
        if (ticket.getSlaDeadline() == null || ticket.getResolvedAt() != null) return false;
        return LocalDateTime.now().isAfter(ticket.getSlaDeadline().minusHours(1));
    }
}
