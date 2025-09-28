import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faChartBar, faArrowUp, faArrowDown, faWallet, faDollarSign, faReceipt, faRedo } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';
// Financial Management Page Component
const FinancialManagement = () => {
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeBreakdown: [],
    expenseBreakdown: [],
    monthlyTrends: [],
    recentIncome: [],
    recentExpenses: []
  });

  const [members, setMembers] = useState([]);
  const [membershipFees, setMembershipFees] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch financial data from MongoDB
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch orders data for income calculation
      let orders = [];
      try {
        const ordersResponse = await api.get('/orders');
        orders = ordersResponse.data || [];
      } catch (err) {
        console.warn('Orders API not available:', err.message);
      }

      // Fetch members data for membership income
      let members = [];
      try {
        const membersResponse = await api.get('/members');
        members = membersResponse.data || [];
        setMembers(members); // Store members data for the membership fee section
      } catch (err) {
        console.warn('Members API not available:', err.message);
        setMembers([]); // Set empty array if API fails
      }

      // Fetch events data for event revenue
      let events = [];
      try {
        const eventsResponse = await api.get('/events');
        events = eventsResponse.data || [];
      } catch (err) {
        console.warn('Events API not available:', err.message);
      }

      // Calculate income breakdown
      const productSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Calculate membership fees based on plan types
      const calculatedMembershipFees = members.reduce((sum, member) => {
        const planName = member.membershipPlan;
        let fee = 0;
        
        if (planName === 'Student Membership') fee = 500;
        else if (planName === 'Ordinary Membership') fee = 1500;
        else if (planName === 'Life Membership') fee = 10000;
        
        return sum + fee;
      }, 0);
      
      setMembershipFees(calculatedMembershipFees);
      
      const eventRevenue = events.reduce((sum, event) => sum + (event.registrationFee || 0), 0);
      
      const totalIncome = productSales + calculatedMembershipFees + eventRevenue;
      
      // If no data is available, use fallback data
      if (totalIncome === 0 && orders.length === 0 && members.length === 0 && events.length === 0) {
        console.log('No data available, using fallback data');
        // Use fallback data for demonstration
        const fallbackData = {
          totalIncome: 125000,
          totalExpenses: 85000,
          netProfit: 40000,
          incomeBreakdown: [
            { category: 'Product Sales', amount: 80000, percentage: 64 },
            { category: 'Membership Fees', amount: 25000, percentage: 20 },
            { category: 'Event Revenue', amount: 20000, percentage: 16 }
          ],
          expenseBreakdown: [
            { category: 'Inventory', amount: 40000, percentage: 47 },
            { category: 'Staff Salaries', amount: 25000, percentage: 29 },
            { category: 'Maintenance', amount: 15000, percentage: 18 },
            { category: 'Marketing', amount: 5000, percentage: 6 }
          ],
          monthlyTrends: [
            { month: 'Jan', income: 100000, expenses: 70000 },
            { month: 'Feb', income: 120000, expenses: 80000 },
            { month: 'Mar', income: 110000, expenses: 75000 },
            { month: 'Apr', income: 130000, expenses: 85000 },
            { month: 'May', income: 125000, expenses: 90000 },
            { month: 'Jun', income: 140000, expenses: 95000 }
          ],
          recentIncome: [
            { category: 'Product Sales', description: 'Cricket Equipment', amount: 15000, date: 'Today' },
            { category: 'Membership Fee', description: 'Annual Membership', amount: 2500, date: 'Yesterday' },
            { category: 'Event Revenue', description: 'Tournament Registration', amount: 8000, date: '2 days ago' }
          ],
          recentExpenses: [
            { category: 'Inventory', description: 'Sports Equipment', amount: 12000, date: 'Today' },
            { category: 'Staff Salary', description: 'Monthly Payment', amount: 8500, date: 'Yesterday' },
            { category: 'Maintenance', description: 'Equipment Repair', amount: 3200, date: '3 days ago' }
          ]
        };
        
        setFinancialData(fallbackData);
        setMembers([]); // Set empty members array for fallback
        setMembershipFees(25000); // Set fallback membership fees
        return;
      }
      
      // Calculate expense breakdown (mock data for now - you can add expense tracking)
      const inventoryExpenses = productSales * 0.4; // 40% of sales for inventory
      const staffSalaries = 25000; // Fixed monthly salary
      const maintenance = 15000; // Fixed maintenance cost
      const marketing = 5000; // Fixed marketing cost
      
      const totalExpenses = inventoryExpenses + staffSalaries + maintenance + marketing;
      const netProfit = totalIncome - totalExpenses;

      // Calculate percentages
      const incomeBreakdown = [
        { 
          category: 'Product Sales', 
          amount: productSales, 
          percentage: totalIncome > 0 ? Math.round((productSales / totalIncome) * 100) : 0 
        },
        { 
          category: 'Membership Fees', 
          amount: membershipFees, 
          percentage: totalIncome > 0 ? Math.round((membershipFees / totalIncome) * 100) : 0 
        },
        { 
          category: 'Event Revenue', 
          amount: eventRevenue, 
          percentage: totalIncome > 0 ? Math.round((eventRevenue / totalIncome) * 100) : 0 
        }
      ];

      const expenseBreakdown = [
        { 
          category: 'Inventory', 
          amount: inventoryExpenses, 
          percentage: totalExpenses > 0 ? Math.round((inventoryExpenses / totalExpenses) * 100) : 0 
        },
        { 
          category: 'Staff Salaries', 
          amount: staffSalaries, 
          percentage: totalExpenses > 0 ? Math.round((staffSalaries / totalExpenses) * 100) : 0 
        },
        { 
          category: 'Maintenance', 
          amount: maintenance, 
          percentage: totalExpenses > 0 ? Math.round((maintenance / totalExpenses) * 100) : 0 
        },
        { 
          category: 'Marketing', 
          amount: marketing, 
          percentage: totalExpenses > 0 ? Math.round((marketing / totalExpenses) * 100) : 0 
        }
      ];

      // Generate monthly trends (last 6 months)
      const monthlyTrends = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        // Calculate monthly data (simplified - you can enhance this with actual monthly data)
        const monthlyIncome = totalIncome * (0.8 + Math.random() * 0.4); // 80-120% of average
        const monthlyExpenses = totalExpenses * (0.8 + Math.random() * 0.4);
        
        monthlyTrends.push({
          month: monthName,
          income: Math.round(monthlyIncome),
          expenses: Math.round(monthlyExpenses)
        });
      }

      // Recent transactions
      const recentIncome = orders.slice(0, 3).map(order => ({
        category: 'Product Sales',
        description: `Order #${order._id?.slice(-6) || 'N/A'}`,
        amount: order.totalAmount || 0,
        date: new Date(order.createdAt || Date.now()).toLocaleDateString()
      }));

      const recentExpenses = [
        { category: 'Inventory', description: 'Sports Equipment', amount: 12000, date: 'Today' },
        { category: 'Staff Salary', description: 'Monthly Payment', amount: 8500, date: 'Yesterday' },
        { category: 'Maintenance', description: 'Equipment Repair', amount: 3200, date: '3 days ago' }
      ];

      setFinancialData({
        totalIncome,
        totalExpenses,
        netProfit,
        incomeBreakdown,
        expenseBreakdown,
        monthlyTrends,
        recentIncome,
        recentExpenses
      });

    } catch (err) {
      console.error('Failed to fetch financial data:', err);
      setError('Failed to load financial data. Using fallback data.');
      
      // Set fallback data even on error
      const fallbackData = {
        totalIncome: 125000,
        totalExpenses: 85000,
        netProfit: 40000,
        incomeBreakdown: [
          { category: 'Product Sales', amount: 80000, percentage: 64 },
          { category: 'Membership Fees', amount: 25000, percentage: 20 },
          { category: 'Event Revenue', amount: 20000, percentage: 16 }
        ],
        expenseBreakdown: [
          { category: 'Inventory', amount: 40000, percentage: 47 },
          { category: 'Staff Salaries', amount: 25000, percentage: 29 },
          { category: 'Maintenance', amount: 15000, percentage: 18 },
          { category: 'Marketing', amount: 5000, percentage: 6 }
        ],
        monthlyTrends: [
          { month: 'Jan', income: 100000, expenses: 70000 },
          { month: 'Feb', income: 120000, expenses: 80000 },
          { month: 'Mar', income: 110000, expenses: 75000 },
          { month: 'Apr', income: 130000, expenses: 85000 },
          { month: 'May', income: 125000, expenses: 90000 },
          { month: 'Jun', income: 140000, expenses: 95000 }
        ],
        recentIncome: [
          { category: 'Product Sales', description: 'Cricket Equipment', amount: 15000, date: 'Today' },
          { category: 'Membership Fee', description: 'Annual Membership', amount: 2500, date: 'Yesterday' },
          { category: 'Event Revenue', description: 'Tournament Registration', amount: 8000, date: '2 days ago' }
        ],
        recentExpenses: [
          { category: 'Inventory', description: 'Sports Equipment', amount: 12000, date: 'Today' },
          { category: 'Staff Salary', description: 'Monthly Payment', amount: 8500, date: 'Yesterday' },
          { category: 'Maintenance', description: 'Equipment Repair', amount: 3200, date: '3 days ago' }
        ]
      };
      
      setFinancialData(fallbackData);
      setMembers([]); // Set empty members array for error fallback
      setMembershipFees(25000); // Set fallback membership fees
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleRefresh = () => {
    fetchFinancialData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <FontAwesomeIcon icon={faRedo} className="mr-2"/>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Financial Management</h1>
          <p className="text-lg text-gray-500 mt-1">Track income, expenses, and financial performance.</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <FontAwesomeIcon icon={faRedo} className={isLoading ? 'animate-spin mr-2' : 'mr-2'}/>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-green-800 bg-green-50 p-4 rounded-t-lg border-b border-green-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faArrowUp} className="mr-3" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">Rs. {financialData.totalIncome.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">+12% from last month</div>
          </CardContent>
        </Card>

        <Card className="border-red-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-red-800 bg-red-50 p-4 rounded-t-lg border-b border-red-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faArrowDown} className="mr-3" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-red-600">Rs. {financialData.totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">+8% from last month</div>
          </CardContent>
        </Card>

        <Card className="border-blue-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-blue-800 bg-blue-50 p-4 rounded-t-lg border-b border-blue-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faWallet} className="mr-3" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">Rs. {financialData.netProfit.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">+15% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Income and Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Income Breakdown - Pie Chart */}
        <Card className="border-green-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-green-800 bg-green-50 p-4 rounded-t-lg border-b border-green-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-3" />
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                {/* Simple Pie Chart using CSS */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent" 
                     style={{
                       background: `conic-gradient(
                         #10B981 0deg 230deg,
                         #3B82F6 230deg 290deg,
                         #F59E0B 290deg 360deg
                       )`
                     }}>
                </div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">Rs. {financialData.totalIncome.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Income</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {financialData.incomeBreakdown.map((item, index) => {
                const colors = ['#10B981', '#3B82F6', '#F59E0B'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }}></div>
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Rs. {item.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown - Pie Chart */}
        <Card className="border-red-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-red-800 bg-red-50 p-4 rounded-t-lg border-b border-red-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-3" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                {/* Simple Pie Chart using CSS */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent" 
                     style={{
                       background: `conic-gradient(
                         #EF4444 0deg 169deg,
                         #F97316 169deg 274deg,
                         #8B5CF6 274deg 325deg,
                         #06B6D4 325deg 360deg
                       )`
                     }}>
                </div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">Rs. {financialData.totalExpenses.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Expenses</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {financialData.expenseBreakdown.map((item, index) => {
                const colors = ['#EF4444', '#F97316', '#8B5CF6', '#06B6D4'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }}></div>
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">Rs. {item.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends - Bar Chart */}
      <div className="mb-8">
        <Card className="border-blue-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-blue-800 bg-blue-50 p-4 rounded-t-lg border-b border-blue-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-3" />
              Monthly Financial Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-6 gap-4 h-64 items-end">
              {financialData.monthlyTrends.map((month, index) => {
                const maxValue = Math.max(...financialData.monthlyTrends.map(m => Math.max(m.income, m.expenses)));
                const incomeHeight = (month.income / maxValue) * 200;
                const expenseHeight = (month.expenses / maxValue) * 200;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex flex-col items-center space-y-1 w-full">
                      <div className="flex flex-col items-center space-y-1">
                        <div 
                          className="w-8 bg-green-500 rounded-t"
                          style={{ height: `${incomeHeight}px` }}
                          title={`Income: Rs. ${month.income.toLocaleString()}`}
                        ></div>
                        <div 
                          className="w-8 bg-red-500 rounded-t"
                          style={{ height: `${expenseHeight}px` }}
                          title={`Expenses: Rs. ${month.expenses.toLocaleString()}`}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600">{month.month}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Fee Management */}
      <div className="mb-8">
        <Card className="border-purple-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-purple-800 bg-purple-50 p-4 rounded-t-lg border-b border-purple-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faWallet} className="mr-3" />
              Membership Fee Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Student</div>
                <div className="text-lg text-gray-600">Rs. 500/year</div>
                <div className="text-sm text-gray-500 mt-1">
                  {members.filter(m => m.membershipPlan === 'Student Membership').length} members
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Ordinary</div>
                <div className="text-lg text-gray-600">Rs. 1,500/year</div>
                <div className="text-sm text-gray-500 mt-1">
                  {members.filter(m => m.membershipPlan === 'Ordinary Membership').length} members
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">Life</div>
                <div className="text-lg text-gray-600">Rs. 10,000/lifetime</div>
                <div className="text-sm text-gray-500 mt-1">
                  {members.filter(m => m.membershipPlan === 'Life Membership').length} members
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Membership Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Student Memberships</span>
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Student Membership').length * 500}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ordinary Memberships</span>
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Ordinary Membership').length * 1500}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Life Memberships</span>
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Life Membership').length * 10000}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Membership Revenue</span>
                    <span className="text-purple-600">Rs. {membershipFees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Recent Membership Payments</h4>
                <div className="space-y-2">
                  {members.slice(0, 3).map((member, index) => {
                    const planName = member.membershipPlan;
                    let fee = 0;
                    if (planName === 'Student Membership') fee = 500;
                    else if (planName === 'Ordinary Membership') fee = 1500;
                    else if (planName === 'Life Membership') fee = 10000;
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <div className="font-medium text-sm">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-gray-500">{planName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">+Rs. {fee}</div>
                          <div className="text-xs text-gray-500">
                            {member.paymentDate ? new Date(member.paymentDate).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {members.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <FontAwesomeIcon icon={faWallet} className="h-8 w-8 text-gray-400 mb-2" />
                      <p>No membership data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-green-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-green-800 bg-green-50 p-4 rounded-t-lg border-b border-green-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-3" />
              Recent Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {financialData.recentIncome.length > 0 ? (
                financialData.recentIncome.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-green-800">{transaction.category}</div>
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+Rs. {transaction.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FontAwesomeIcon icon={faDollarSign} className="h-12 w-12 text-gray-400 mb-4" />
                  <p>No recent income transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-red-800 bg-red-50 p-4 rounded-t-lg border-b border-red-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faReceipt} className="mr-3" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {financialData.recentExpenses.length > 0 ? (
                financialData.recentExpenses.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-red-800">{transaction.category}</div>
                      <div className="text-sm text-gray-600">{transaction.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">-Rs. {transaction.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FontAwesomeIcon icon={faReceipt} className="h-12 w-12 text-gray-400 mb-4" />
                  <p>No recent expense transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialManagement;
