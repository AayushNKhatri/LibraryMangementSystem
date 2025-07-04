﻿using server.Dtos;
using server.Entities;

namespace server.Services.Interface
{
    public interface IBookInterface
    {
        Task<Book> AddBooks(Book book, BookFilters bookFilters, BookInventory bookInventory);

        Task<List<Book>>GetBooks();

        Task DeleteBook(Guid bookID);

        Task UpdateBook(Guid bookID, UpdateBookDto updateBookDto);

        Task <List<Book>> GetById(Guid bookID);
        Task <bool> AddImage(Guid bookId, IFormFile image);
        Task<bool> UpdateImage(Guid bookId, IFormFile image);
    }
}
