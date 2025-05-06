using server.Entities;

namespace server.Services.Interface
{
    public interface IBookInterface
    {
        Task AddBooks(Book book, BookFilters bookFilters, BookInventory bookInventory);

        Task<List<Book>>GetBooks();
    }
}
