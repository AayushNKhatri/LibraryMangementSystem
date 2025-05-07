namespace server.Entities.Enum
{
    public enum BookLanguage
    {
        Nepali,
        English,
    }
     public enum Status
    {
        Available,
        Unavailable,
    }
    public enum Category{
        Fiction,
        Nonfiction,
        Science,
        History,
        Romance
    }
    public enum Genre{
        Fantasy,
        Thriller,
        Drama,
        Adventure,
        Biography,
        Other
    }

    public enum Format {
        Paperback,
        Hardcover,
        Signed,
        Collectors,
        Deluxe,
        Other
    }

    public enum OrderStatus {
        Pending,
        Completed,
        Cancelled
    }

    public enum AnnouncementType {
        Deal,
        New_Arrival,
        Information
    }
}