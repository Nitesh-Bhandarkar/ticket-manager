package com.ticketmanager.controller;

import com.ticketmanager.dto.ReplyRequest;
import com.ticketmanager.dto.TicketDTO;
import com.ticketmanager.enums.TicketStatus;
import com.ticketmanager.model.Ticket;
import com.ticketmanager.service.GmailService;
import com.ticketmanager.service.SLAService;
import com.ticketmanager.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final Optional<GmailService> gmailService;
    private final SLAService slaService;

    @Autowired
    public TicketController(TicketService ticketService,
                            @Autowired(required = false) GmailService gmailService,
                            SLAService slaService) {
        this.ticketService = ticketService;
        this.gmailService = Optional.ofNullable(gmailService);
        this.slaService = slaService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<List<Ticket>> getMyTickets(@AuthenticationPrincipal UserDetails principal) {
        // TODO: resolve agentId from principal email via UserRepository
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Ticket> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable UUID id,
                                               @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable UUID id,
                                               @RequestParam UUID agentId) {
        return ResponseEntity.ok(ticketService.assignToAgent(id, agentId));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Void> sendReply(@PathVariable UUID id,
                                          @Valid @RequestBody ReplyRequest request,
                                          @AuthenticationPrincipal UserDetails principal) {
        Ticket ticket = ticketService.getTicketById(id);
        gmailService.ifPresent(gmail ->
                gmail.sendReply(ticket.getGmailThreadId(), ticket.getEmailFrom(),
                        "Re: " + ticket.getSubject(), request.getBody()));
        ticketService.updateStatus(id, TicketStatus.RESOLVED);
        return ResponseEntity.ok().build();
    }
}
