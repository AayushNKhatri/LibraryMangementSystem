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
    public class AnnouncementService: IAnnouncementService
    {
        private readonly ApplicationDbContext _dbContext;
        public AnnouncementService(ApplicationDbContext dbContext){
            _dbContext = dbContext;
        }
        public async Task<Announcement> CreateAnnouncement(Announcement announcement){
            await _dbContext.Announcements.AddAsync(announcement);
            await _dbContext.SaveChangesAsync();
            return announcement;
        }

        public async Task<bool> DeleteAnnouncement(Guid id)
        {
            var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == id);
            if (announcement == null)
                throw new Exception("No Announcment found by that id");
            _dbContext.Announcements.Remove(announcement);
            _dbContext.SaveChanges();
            return true;
        }

        public Task<List<Announcement>> GetAllAnnouncements()
        {
            return _dbContext.Announcements.ToListAsync();
        }

        public async Task<Announcement> GetAnnouncementById(Guid id)
        {
            var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == id);
            return announcement;
        }

        public async Task<Announcement> UpdateAnnouncement(CreateAnnouncementDTO createAnnouncement, Guid Id)
        {
            var updateAnnouncement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.AnnouncementId == Id);
            if (updateAnnouncement == null)
                throw new Exception("No announcement found");

            if (!string.IsNullOrEmpty(createAnnouncement.AnnouncementDescription))
                updateAnnouncement.AnnouncementDescription = createAnnouncement.AnnouncementDescription;

            if (Enum.IsDefined(typeof(AnnouncementType), createAnnouncement.AnnouncementType))
                updateAnnouncement.AnnouncementType = createAnnouncement.AnnouncementType;

            await _dbContext.SaveChangesAsync();
            return updateAnnouncement;
        }


    }
}
