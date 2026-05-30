package com.ticketmanager.controller;

import com.ticketmanager.model.KnowledgeBaseEntry;
import com.ticketmanager.service.KnowledgeBaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge-base")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<List<KnowledgeBaseEntry>> getAll() {
        return ResponseEntity.ok(knowledgeBaseService.getAllEntries());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<KnowledgeBaseEntry> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(knowledgeBaseService.getEntryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<KnowledgeBaseEntry> addEntry(@RequestBody KnowledgeBaseEntry entry,
                                                        @AuthenticationPrincipal UserDetails principal) {
        // TODO: resolve User from principal email via UserRepository, then call knowledgeBaseService.addEntry(...)
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
