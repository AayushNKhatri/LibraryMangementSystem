using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Entities;
using server.Services.Interface;

namespace server.Services
{
    public class BookmarkService (ApplicationDbContext _context): IBookmarkServices
    {
        public async Task<bool> AddBookmark(Guid bookId, string UserId)
        {
            if (string.IsNullOrEmpty(UserId))
                return false;

            var existingBookmark = await _context.Bookmarks.FirstOrDefaultAsync(b => b.BookId == bookId && b.UserId == UserId);

            if (existingBookmark != null)
                return false;

            var bookmark = new Bookmark
            {
                BookmarkId = Guid.NewGuid(),
                BookId = bookId,
                UserId = UserId
            };

            await _context.Bookmarks.AddAsync(bookmark);
            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<bool> DeleteBookmark(Guid bookmarkId)
        {
            var bookmark = await _context.Bookmarks.FirstOrDefaultAsync(b => b.BookmarkId == bookmarkId);

            if (bookmark == null) return false;

            _context.Bookmarks.Remove(bookmark);
            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<List<Bookmark>> GetBookmark(string id)
        {
                return await _context.Bookmarks
                .Where(b => b.UserId == id)
                .Include(b => b.Book).ToListAsync();
        }

        public async Task<List<Bookmark>> GetBookmarkByID(Guid BookmarkId)
        {
            return await _context.Bookmarks
            .Where(u => u.BookmarkId == BookmarkId)
            .Include(b => b.Book).ToListAsync();
        }
    }
}
