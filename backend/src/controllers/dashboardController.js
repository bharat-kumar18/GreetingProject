const DashboardService = require('../services/dashboardService');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await DashboardService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
