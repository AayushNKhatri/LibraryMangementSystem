using server.Dtos;
using server.Entities;

namespace server.Services.Interface
{
    public interface IAnnouncementService
    {
        Task<Announcement> CreateAnnouncement(Announcement announcement);
        Task<Announcement> UpdateAnnouncement(CreateAnnouncementDTO createAnnouncement, Guid Id);
        Task <bool> DeleteAnnouncement(Guid id);
        Task <Announcement> GetAnnouncementById(Guid id);
        Task <List<Announcement>> GetAllAnnouncements();
    }
}
