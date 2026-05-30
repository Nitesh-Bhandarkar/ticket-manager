package com.ticketmanager.repository;

import com.ticketmanager.model.KnowledgeBaseEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBaseEntry, UUID> {
    List<KnowledgeBaseEntry> findByCategory(String category);
}
