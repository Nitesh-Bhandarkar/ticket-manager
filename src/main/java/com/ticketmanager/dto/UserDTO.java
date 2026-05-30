package com.ticketmanager.dto;

import com.ticketmanager.enums.UserRole;
import com.ticketmanager.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDTO(UUID id, String email, String name, UserRole role, LocalDateTime createdAt) {
    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getCreatedAt());
    }
}
