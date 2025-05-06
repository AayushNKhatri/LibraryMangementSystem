using Microsoft.AspNetCore.SignalR;

namespace SignalR.hub {
    public class NotificationHub : Hub {
        public async Task SendMessage(string message) {
            await Clients.All.SendAsync("Receive", message);
        }
    }
}