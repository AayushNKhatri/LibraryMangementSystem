using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace server.Services.Interface
{
    public interface IImageService
    {
        Task<string> SaveFile(string baseFolder, string subFolder, IFormFile file, string vechileId, string existingFilePath = null);
    }
}
