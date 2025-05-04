using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using server.Entities.Enum;

namespace server.Dtos
{
    public class CreateAnnouncementDTO
    {
        public AnnouncementType AnnouncementType {get; set;}
        public string AnnouncementDescription {get; set;} = string.Empty;
        public DateTime StartDate {get; set;}
        public DateTime EndDate {get; set;}
    }
}
