using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using server.Services.Interface;

namespace server.Services
{
    public class ImageService:IImageService
    {
        public async Task<string> SaveFile(string basePath, string subFolder, IFormFile file, string Id, string existingFilePath = null)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Invalid file. Please provide a valid file.");

            // Ensure the upload directory exists
            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), basePath, subFolder, Id);
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            // Check if there's an existing file path to delete
            if (!string.IsNullOrEmpty(existingFilePath))
            {
                // Only delete the old file if it exists
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), basePath, existingFilePath);
                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath); // Deleting the old file if it exists
                }
            }

            // Generate a unique file name for the new file
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadFolder, fileName);

            // Save the new file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for retrieval
            return Path.Combine(subFolder, Id, fileName).Replace("\\", "/");
        }
    }
}
