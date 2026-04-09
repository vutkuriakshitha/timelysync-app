package com.timelysync.service;

import com.timelysync.model.Achievement;
import com.timelysync.model.Notification;
import com.timelysync.model.User;
import com.timelysync.payload.response.AchievementDto;
import com.timelysync.payload.response.UserStatsDto;
import com.timelysync.repository.AchievementRepository;
import com.timelysync.repository.NotificationRepository;
import com.timelysync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserStatsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AchievementRepository achievementRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public UserStatsDto getUserStats(User user) {
        UserStatsDto stats = new UserStatsDto();
        
        int streak = calculateStreak(user);
        user.setStreakDays(streak);
        userRepository.save(user);
        stats.setStreak(streak);
        
        List<Achievement> unlockedAchievements = achievementRepository.findByUserIdAndUnlockedTrueOrderByUnlockedAtDesc(user.getId());
        stats.setAchievements(unlockedAchievements.stream()
            .map(this::mapToAchievementDto)
            .collect(Collectors.toList()));
        
        stats.setLevel(user.getLevel());
        stats.setXp(user.getXpPoints());
        stats.setNextLevelXp(calculateNextLevelXp(user.getLevel()));
        stats.setCoins(user.getXpPoints() / 100);
        
        return stats;
    }
    
    private int calculateStreak(User user) {
        if (user.getLastActivityDate() == null) return 0;
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastActivityDate = user.getLastActivityDate();
        
        long daysBetween = ChronoUnit.DAYS.between(lastActivityDate.toLocalDate(), now.toLocalDate());
        
        if (daysBetween == 0) return user.getStreakDays();
        if (daysBetween == 1) return user.getStreakDays() + 1;
        return 0;
    }
    
    private int calculateNextLevelXp(int currentLevel) {
        return currentLevel * 1000;
    }
    
    @Transactional
    public Achievement checkAndUnlockAchievement(User user, String type, String metadata) {
        Achievement existing = achievementRepository.findByUserIdAndType(user.getId(), type).orElse(null);
        
        if (existing != null && existing.getUnlocked()) {
            return null;
        }
        
        Achievement achievement = new Achievement();
        achievement.setUserId(user.getId());
        achievement.setType(type);
        achievement.setUnlocked(true);
        achievement.setUnlockedAt(LocalDateTime.now());
        
        if ("first_task".equals(type)) {
            achievement.setTitle("First Steps");
            achievement.setDescription("Completed your first task!");
            achievement.setIcon("star");
            achievement.setColor("warning");
            achievement.setXpReward(100);
        } else if ("task_complete_10".equals(type)) {
            achievement.setTitle("Task Master");
            achievement.setDescription("Completed 10 tasks!");
            achievement.setIcon("target");
            achievement.setColor("success");
            achievement.setXpReward(500);
        } else if ("streak_7".equals(type)) {
            achievement.setTitle("Weekly Warrior");
            achievement.setDescription("Maintained a 7 day streak!");
            achievement.setIcon("zap");
            achievement.setColor("info");
            achievement.setXpReward(300);
        } else if ("on_time_5".equals(type)) {
            achievement.setTitle("Punctual Pro");
            achievement.setDescription("Completed 5 tasks on time!");
            achievement.setIcon("clock");
            achievement.setColor("primary");
            achievement.setXpReward(250);
        } else {
            return null;
        }
        
        user.setXpPoints(user.getXpPoints() + achievement.getXpReward());
        
        int nextLevelXp = calculateNextLevelXp(user.getLevel());
        if (user.getXpPoints() >= nextLevelXp) {
            user.setLevel(user.getLevel() + 1);
            createLevelUpAchievement(user);
        }
        
        userRepository.save(user);
        achievementRepository.save(achievement);
        
        createNotification(user, "achievement", 
            "🏆 Achievement Unlocked: " + achievement.getTitle() + "! +" + achievement.getXpReward() + " XP");
        
        return achievement;
    }
    
    private void createLevelUpAchievement(User user) {
        Achievement levelUp = new Achievement();
        levelUp.setUserId(user.getId());
        levelUp.setType("level_up_" + user.getLevel());
        levelUp.setTitle("Level Up!");
        levelUp.setDescription("Reached Level " + user.getLevel());
        levelUp.setIcon("trending-up");
        levelUp.setColor("warning");
        levelUp.setXpReward(0);
        levelUp.setUnlocked(true);
        levelUp.setUnlockedAt(LocalDateTime.now());
        achievementRepository.save(levelUp);
        
        createNotification(user, "achievement", 
            "🎉 Congratulations! You've reached Level " + user.getLevel() + "!");
    }
    
    private void createNotification(User user, String type, String message) {
        Notification notification = new Notification(user, type, message);
        notificationRepository.save(notification);
    }
    
    private AchievementDto mapToAchievementDto(Achievement achievement) {
        AchievementDto dto = new AchievementDto();
        dto.setId(achievement.getId());
        dto.setTitle(achievement.getTitle());
        dto.setDescription(achievement.getDescription());
        dto.setType(achievement.getType());
        dto.setIcon(achievement.getIcon());
        dto.setColor(achievement.getColor());
        dto.setXpReward(achievement.getXpReward());
        dto.setUnlocked(achievement.getUnlocked());
        dto.setLevel(achievement.getLevel());
        return dto;
    }
}
