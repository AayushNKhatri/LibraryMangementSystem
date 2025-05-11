using server.Entities.Enum;
namespace server.Dtos
{
    public class BookDto
    {
        public string Title { get; set; }

        public string ISBN { get; set; }

        public string Description { get; set; }

        public string Publisher { get; set; }

        public BookLanguage Language { get; set; }

        public DateTime PublicationDate { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public Status Status { get; set; }

        public Category Category { get; set; }

        public Genre Genre { get; set; }

        public Format Format { get; set; }

        public int Quantity { get; set; }

        public double Price { get; set; }

        public bool IsOnSale { get; set; }

        public int DiscountPercent { get; set; }

        public DateTime DiscoundStartDate { get; set; }

        public DateTime DiscoundEndDate { get; set; }
    }
}
