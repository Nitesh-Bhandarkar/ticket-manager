package com.ticketmanager.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_base")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KnowledgeBaseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String problemDescription;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String resolution;

    private String vectorStoreDocId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
