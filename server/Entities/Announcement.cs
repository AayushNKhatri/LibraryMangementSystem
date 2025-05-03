using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class Announcement {
        [Key]
        public Guid AnnouncementId {get; set;}
        [Required]
        public AnnouncementType AnnouncementType {get; set;}

        [Required]
        public string AnnouncementDescription {get; set;} = string.Empty;

        [Required]
        public DateTime StartDate {get; set;}

        [Required]
        public DateTime EndDate {get; set;}
    }
}