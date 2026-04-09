package com.timelysync.service;

import com.timelysync.model.Notification;
import com.timelysync.model.User;
import com.timelysync.payload.response.NotificationDto;
import com.timelysync.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public List<NotificationDto> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return notifications.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<NotificationDto> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        return notifications.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }
    
    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }
    
    public void createNotification(User user, String type, String message) {
        createNotification(user, type, message, null);
    }
    
    public void createNotification(User user, String type, String message, String metadata) {
        Notification notification = new Notification(user, type, message);
        notification.setMetadata(metadata);
        notificationRepository.save(notification);
    }
    
    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.getRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setMetadata(notification.getMetadata());
        return dto;
    }
}
