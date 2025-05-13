using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Dtos;
using server.Entities;
using server.Entities.Enum;
using server.Services.Interface;

namespace server.Services
{
    public class AnnouncementService(ApplicationDbContext dbContext, INotificationService _notificationService) : IAnnouncementService
    {
        private readonly ApplicationDbContext _dbContext = dbContext;

        public async Task<Announcement> CreateAnnouncement(Announcement announcement){
            await _dbContext.Announcements.AddAsync(announcement);
            await _dbContext.SaveChangesAsync();
            var notification = new Notification{
                Id = Guid.NewGuid(),
                NotificationDescription = announcement.AnnouncementDescription,
                Type = announcement.AnnouncementType.ToString(),
                NotificationDate = DateTime.UtcNow,
                IsRead = false,
                };
                
                // Get all users from the database to send notifications
                var users = await _dbContext.Users.ToListAsync();
                foreach (var user in users)
                {
                    // Create notification for each user
                    await _notificationService.CreateNotification(user.Id, announcement.AnnouncementDescription);
                }
                
                return announcement;
        }

        public async Task<bool> DeleteAnnouncement(Guid id)
        {
            var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == id) ?? throw new Exception("No Announcment found by that id");
            _dbContext.Announcements.Remove(announcement);
            _dbContext.SaveChanges();
            return true;
        }

        public async Task<List<Announcement>> GetAllAnnouncements()
        {
            var now = DateTime.UtcNow;

    // Get all announcements
            var allAnnouncements = await _dbContext.Announcements.ToListAsync();

    // Find expired ones
            var expiredAnnouncements = allAnnouncements
                .Where(a => a.EndDate < now)
                .ToList();

    // Remove expired ones
            if (expiredAnnouncements.Any())
            {
                _dbContext.Announcements.RemoveRange(expiredAnnouncements);
                await _dbContext.SaveChangesAsync();
            }

    // Return only active announcements
            var activeAnnouncements = allAnnouncements
            .Where(a => a.EndDate >= now)
            .ToList();

            return activeAnnouncements;
        }

        public async Task<Announcement> GetAnnouncementById(Guid id)
        {
                  var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == id);
            return announcement;

        }

        public async Task<Announcement> UpdateAnnouncement(CreateAnnouncementDTO createAnnouncement, Guid Id)
        {
            var updateAnnouncement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == Id) ?? throw new Exception("No announcement found");
            if (!string.IsNullOrEmpty(createAnnouncement.AnnouncementDescription))
                updateAnnouncement.AnnouncementDescription = createAnnouncement.AnnouncementDescription;

            if (Enum.IsDefined(typeof(AnnouncementType), createAnnouncement.AnnouncementType))
                updateAnnouncement.AnnouncementType = createAnnouncement.AnnouncementType;

            await _dbContext.SaveChangesAsync();
            return updateAnnouncement;
        }


    }
}
