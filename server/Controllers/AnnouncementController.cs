using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnoucmentController(IAnnouncementService _announcementService) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateAnnoucment([FromBody] CreateAnnouncementDTO createAnnouncement){
            try{
                if(createAnnouncement == null)
                    return BadRequest("Please fill up the deatial");
                var newAnnouncment = new Announcement{
                    AnnouncementId =  Guid.NewGuid(),
                    AnnouncementDescription = createAnnouncement.AnnouncementDescription,
                    AnnouncementType = createAnnouncement.AnnouncementType,
                    StartDate = DateTime.UtcNow,
                    EndDate = createAnnouncement.EndDate
                };
                var announcement = await _announcementService.CreateAnnouncement(newAnnouncment);
                return Ok(announcement);
            }
            catch (Exception ex){
               throw new Exception("Registration failed" + ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnnouncementByID(Guid id)
        {
            try{
                return Ok(await _announcementService.GetAnnouncementById(id));
            }
            catch (Exception ex){
                throw new Exception($"Cant Get id {ex}");
            }
        }
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAnnouncements(){
            try{
                return Ok(await _announcementService.GetAllAnnouncements());
            }
            catch(Exception ex){
                throw new Exception($"Cant get all anouncment {ex}");
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncements(CreateAnnouncementDTO createAnnouncement, Guid id){
            try{
                var updateAnnouncement = await _announcementService.UpdateAnnouncement(createAnnouncement, id);
                return Ok(updateAnnouncement);
            }
            catch (Exception ex) {

                throw new Exception($"Cannt update announcment {ex}");
            }
        }
    }
}
