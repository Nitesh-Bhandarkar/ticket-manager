package com.ticketmanager.service;

import com.ticketmanager.model.KnowledgeBaseEntry;
import com.ticketmanager.model.User;
import com.ticketmanager.repository.KnowledgeBaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeBaseService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;

    // TODO Phase 5: inject VectorStore (spring-ai-pgvector-store-spring-boot-starter)

    public KnowledgeBaseEntry addEntry(String title, String category,
                                       String problemDescription, String resolution,
                                       User createdBy) {
        // TODO Phase 5: save to DB then add Document to VectorStore
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public Optional<String> findBestResolution(String query, double similarityThreshold) {
        // TODO Phase 5: similarity search via VectorStore, return resolution if score >= threshold
        return Optional.empty();
    }

    public List<KnowledgeBaseEntry> getAllEntries() {
        return knowledgeBaseRepository.findAll();
    }

    public KnowledgeBaseEntry getEntryById(UUID id) {
        return knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Knowledge base entry not found: " + id));
    }
}
