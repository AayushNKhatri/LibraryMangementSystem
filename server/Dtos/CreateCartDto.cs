using System.ComponentModel.DataAnnotations;

namespace server.Dtos
{
    public class CreateCartDto
    {
        public string UserId {get; set;}
        public Guid BookId {get; set;}
        [Range(1,100,ErrorMessage =("Invalid: Enter number from 1 and 100"))]
        public int Count {get; set;}
        
    }
}