using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace server.Dtos
{
    public class GetOrderSummaryDto
    {

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Contact { get; set; }
        public string City { get; set; }
        public string Street {get; set;}
        public int Quantity {get; set;}
        public double Price {get; set;}
        public double TotalAmount {get; set;}
        public int DiscountApplied {get; set;}
    }
}