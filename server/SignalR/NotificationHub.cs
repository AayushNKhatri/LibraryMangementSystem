using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SignalR.hub {
    [Authorize]
    public class NotificationHub : Hub {
        private static readonly Dictionary<string, List<string>> _userConnections = new Dictionary<string, List<string>>();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                string connectionId = Context.ConnectionId;
                
                lock (_userConnections)
                {
                    if (!_userConnections.ContainsKey(userId))
                    {
                        _userConnections[userId] = new List<string>();
                    }
                    
                    _userConnections[userId].Add(connectionId);
                }
                
                await Groups.AddToGroupAsync(connectionId, userId);
                await base.OnConnectedAsync();
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                string connectionId = Context.ConnectionId;
                
                lock (_userConnections)
                {
                    if (_userConnections.ContainsKey(userId))
                    {
                        _userConnections[userId].Remove(connectionId);
                        
                        if (_userConnections[userId].Count == 0)
                        {
                            _userConnections.Remove(userId);
                        }
                    }
                }
                
                await Groups.RemoveFromGroupAsync(connectionId, userId);
                await base.OnDisconnectedAsync(exception);
            }
        }

        public async Task SendMessage(string message) {
            await Clients.All.SendAsync("Receive", message);
        }
    }
}