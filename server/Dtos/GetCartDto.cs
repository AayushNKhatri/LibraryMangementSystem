namespace server.Dtos
{
    public class GetCartDto
    {
        public string UserId {get; set;}
        public Guid BookId {get; set;}
        public int Count {get; set;}
        
    }
}