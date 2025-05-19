import bookService from './bookService';
import userService from './userService';
import orderService from './OrderServer';

const dashboardService = {
  // Get dashboard summary data
  getDashboardSummary: async () => {
    try {
      // Fetch data using existing service functions
      const [orders, books, users] = await Promise.all([
        orderService.getAllOrders(),
        bookService.getAllBooks(),
        userService.getAllUsers()
      ]);

      // Calculate total sales
      const totalSales = orders
        .filter(order => order.orderStatus === 2) // Assuming 2 is "Completed" status
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Count total orders
      const totalOrders = orders.length;

      // Count low stock items
      const lowStockItems = books
        .filter(book => book.inventories &&
                book.inventories[0] &&
                book.inventories[0].quantity < 10)
        .length;

      // Count verified users
      const verifiedUsers = users
        .filter(user => user.isVerified)
        .length;

      // Return formatted summary data
      return {
        totalSales,
        totalOrders,
        lowStockItems,
        verifiedUsers,
        recentOrders: orders
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 5)
          .map(order => ({
            id: order.orderId,
            user: order.user,
            customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : (order.userName || 'Anonymous'),
            email: order.user?.email,
            total: order.totalAmount,
            status: order.orderStatus === 1 ? 'Completed' :
                   order.orderStatus === 0 ? 'Pending' : 'Cancelled',
            orderStatus: order.orderStatus // Include the raw status code for reference
          })),
        lowStockBooks: books
          .filter(book => book.inventories &&
                  book.inventories[0] &&
                  book.inventories[0].quantity < 10)
          .slice(0, 5)
          .map(book => ({
            id: book.bookId,
            title: book.title,
            stock: book.inventories[0].quantity
          }))
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return default data in case of error
      return {
        totalSales: 0,
        totalOrders: 0,
        lowStockItems: 0,
        verifiedUsers: 0,
        recentOrders: [],
        lowStockBooks: []
      };
    }
  }
};

export default dashboardService;
