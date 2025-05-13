using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using server.Entities;
using server.Entities.Enum;

namespace server.Services.Interface
{
    public interface IFilterService
    {
        Task<List<Book>> FilterByLanguageAsync(BookLanguage language);
        Task<List<Book>> FilterByStatusAsync(Status status);
        Task<List<BookFilters>> FilterByCategoryAsync(Category category);
        Task<List<BookFilters>> FilterByGenreAsync(Genre genre);
        Task<List<BookFilters>> FilterByFormatAsync(Format format);
        Task<List<Author>> FilterByAuthorAsync();
        Task<List<Book>> FilterByNewArrivalAsync(DateTime arrivalDate);

        Task<List<BookFilters>> FilterByCollectorsAsync();
        Task<List<BookFilters>> FilterByPaperbacksAsync();
        Task<List<BookFilters>> FilterByFantasyAsync();
        Task<List<BookFilters>> FilterByAdventureAsync();
        Task<List<BookFilters>> FilterByScienceAsync();
        Task<List<BookFilters>> FilterByFictionAsync();
        Task<List<BookFilters>> FilterByNonFictionAsync();
    }
}