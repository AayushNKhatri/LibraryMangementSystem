using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using server.Entities;

namespace server.Services.Interface
{
    public interface IBookmarkServices
    {
        Task<bool> AddBookmark(Guid bookId, string UserId);
        Task<bool> DeleteBookmark(Guid bookmarkId);
        Task<List<Bookmark>> GetBookmark(string id);
        Task<List<Bookmark>> GetBookmarkByID(Guid BookmarkId);
    }
}
