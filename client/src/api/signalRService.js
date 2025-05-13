import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Get the API URL from environment or use default
const API_URL = 'http://localhost:5129';

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = new Map();
  }

  // Start a connection to the notification hub
  async startConnection(token) {
    if (this.connection) {
      return;
    }

    // Create the connection
    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/notificationhub`, {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // Set up event handlers for notifications
    this.connection.on('ReceiveNotification', (notification) => {
      // Call all registered callbacks with the notification
      this.callbacks.forEach(callback => {
        callback(notification);
      });
    });

    try {
      await this.connection.start();
      console.log('SignalR connection established');
      return true;
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      return false;
    }
  }

  // Register a callback to receive notifications
  onNotification(id, callback) {
    this.callbacks.set(id, callback);
  }

  // Remove a callback
  removeNotificationCallback(id) {
    this.callbacks.delete(id);
  }

  // Stop the connection
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.callbacks.clear();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }
}

// Create and export a singleton instance
const signalRService = new SignalRService();
export default signalRService; 