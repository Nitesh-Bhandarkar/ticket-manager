package com.ticketmanager.dto;

import com.ticketmanager.enums.TicketPriority;
import com.ticketmanager.enums.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TicketDTO {
    private UUID id;
    private String subject;
    private String emailFrom;
    private String category;
    private TicketPriority priority;
    private TicketStatus status;
    private UUID assignedAgentId;
    private String assignedAgentName;
    private LocalDateTime slaDeadline;
    private boolean slaBreached;
    private boolean slaAtRisk;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
