import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faChartBar, faArrowUp, faArrowDown, faWallet, faDollarSign, faReceipt, faRedo } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';

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
  const [eventPayments, setEventPayments] = useState([]);
  const [preOrderPayments, setPreOrderPayments] = useState([]);

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

      // Fetch event payments data for accurate revenue calculation
      let eventPaymentsData = [];
      try {
        const eventPaymentsResponse = await api.get('/events/payments/all');
        eventPaymentsData = eventPaymentsResponse.data?.payments || [];
        setEventPayments(eventPaymentsData);
        console.log('Event Payments Data:', eventPaymentsData);
        console.log('Event Payments Total Revenue:', eventPaymentsResponse.data?.totalRevenue);
      } catch (err) {
        console.warn('Event payments API not available:', err.message);
        setEventPayments([]);
      }

      // Fetch pre-order payments data for expense calculation
      let preOrderPaymentsData = [];
      try {
        const preOrderPaymentsResponse = await api.get('/admin/pre-order-payments/financial/all');
        preOrderPaymentsData = preOrderPaymentsResponse.data?.payments || [];
        setPreOrderPayments(preOrderPaymentsData);
        console.log('Pre-Order Payments Data:', preOrderPaymentsData);
        console.log('Pre-Order Payments Total Amount:', preOrderPaymentsResponse.data?.totalAmount);
      } catch (err) {
        console.warn('Pre-order payments API not available:', err.message);
        setPreOrderPayments([]);
      }

      // Calculate income breakdown
      const productSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Calculate membership fees based on plan types
      const calculatedMembershipFees = members.reduce((sum, member) => {
        const planName = member.membershipPlan;
        let fee = 0;
        
        if (planName === 'Student Membership') fee = 20000;
        else if (planName === 'Ordinary Membership') fee = 60000;
        else if (planName === 'Life Membership') fee = 100000;
        
        return sum + fee;
      }, 0);
      
      setMembershipFees(calculatedMembershipFees);
      
      // Calculate event revenue from actual payments instead of just event fees
      const eventRevenue = eventPaymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      console.log('Calculated Event Revenue:', eventRevenue);
      console.log('Event Payments for calculation:', eventPaymentsData.map(p => ({ event: p.eventId?.name, amount: p.amount })));
      
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
        setEventPayments([]); // Set empty event payments for fallback
        setPreOrderPayments([]); // Set empty pre-order payments for fallback
        return;
      }
      
      // Calculate expense breakdown including pre-order payments
      const inventoryExpenses = productSales * 0.4; // 40% of sales for inventory
      const staffSalaries = 25000; // Fixed monthly salary
      const maintenance = 15000; // Fixed maintenance cost
      const marketing = 5000; // Fixed marketing cost
      const preOrderExpenses = preOrderPaymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const totalExpenses = inventoryExpenses + staffSalaries + maintenance + marketing + preOrderExpenses;
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
          category: 'Pre-Order Payments', 
          amount: preOrderExpenses, 
          percentage: totalExpenses > 0 ? Math.round((preOrderExpenses / totalExpenses) * 100) : 0 
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

      // Recent transactions - combine orders and event payments
      const recentOrders = orders.slice(0, 2).map(order => ({
        category: 'Product Sales',
        description: `Order #${order._id?.slice(-6) || 'N/A'}`,
        amount: order.totalAmount || 0,
        date: new Date(order.createdAt || Date.now()).toLocaleDateString()
      }));

      const recentEventPayments = eventPaymentsData.slice(0, 2).map(payment => ({
        category: 'Event Revenue',
        description: payment.eventId?.name || 'Event Registration',
        amount: payment.amount || 0,
        date: new Date(payment.paymentDate || Date.now()).toLocaleDateString()
      }));

      const recentIncome = [...recentOrders, ...recentEventPayments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

      // Recent expenses including pre-order payments
      const recentPreOrderPayments = preOrderPaymentsData.slice(0, 2).map(payment => ({
        category: 'Pre-Order Payment',
        description: `Payment to ${payment.supplierId?.name || 'Supplier'}`,
        amount: payment.amount || 0,
        date: new Date(payment.paymentDate || Date.now()).toLocaleDateString()
      }));

      const recentExpenses = [
        ...recentPreOrderPayments,
        { category: 'Inventory', description: 'Sports Equipment', amount: 12000, date: 'Today' },
        { category: 'Staff Salary', description: 'Monthly Payment', amount: 8500, date: 'Yesterday' },
        { category: 'Maintenance', description: 'Equipment Repair', amount: 3200, date: '3 days ago' }
      ].slice(0, 3); // Limit to 3 most recent

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
      setEventPayments([]); // Set empty event payments for error fallback
      setPreOrderPayments([]); // Set empty pre-order payments for error fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing financial data...');
    fetchFinancialData();
  };

  // Debug function to check payments
  const debugPayments = () => {
    console.log('=== Payments Debug ===');
    console.log('Current eventPayments state:', eventPayments);
    console.log('Current preOrderPayments state:', preOrderPayments);
    console.log('Membership fees:', membershipFees);
    console.log('Financial data:', financialData);
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
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <FontAwesomeIcon icon={faRedo} className={isLoading ? 'animate-spin mr-2' : 'mr-2'}/>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={debugPayments} variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            Debug Payments
          </Button>
        </div>
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
                         #EF4444 0deg 120deg,
                         #F97316 120deg 200deg,
                         #8B5CF6 200deg 260deg,
                         #06B6D4 260deg 320deg,
                         #10B981 320deg 360deg
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
                const colors = ['#EF4444', '#F97316', '#8B5CF6', '#06B6D4', '#10B981'];
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
                <div className="text-lg text-gray-600">Rs. 20,000/year</div>
                <div className="text-sm text-gray-500 mt-1">
                  {members.filter(m => m.membershipPlan === 'Student Membership').length} members
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Ordinary</div>
                <div className="text-lg text-gray-600">Rs. 60,000/year</div>
                <div className="text-sm text-gray-500 mt-1">
                  {members.filter(m => m.membershipPlan === 'Ordinary Membership').length} members
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">Life</div>
                <div className="text-lg text-gray-600">Rs. 100,000/lifetime</div>
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
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Student Membership').length * 20000}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ordinary Memberships</span>
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Ordinary Membership').length * 60000}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Life Memberships</span>
                    <span className="font-semibold">Rs. {members.filter(m => m.membershipPlan === 'Life Membership').length * 100000}</span>
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
                    if (planName === 'Student Membership') fee = 20000;
                    else if (planName === 'Ordinary Membership') fee = 60000;
                    else if (planName === 'Life Membership') fee = 100000;
                    
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

      {/* Event Payments Summary */}
      <div className="mb-8">
        <Card className="border-blue-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-blue-800 bg-blue-50 p-4 rounded-t-lg border-b border-blue-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-3" />
              Event Payments Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Total Event Revenue</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Rs. {eventPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  From {eventPayments.length} completed payments
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Recent Event Payments</h4>
                <div className="space-y-2">
                  {eventPayments.slice(0, 3).map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <div className="font-medium text-sm">{payment.eventId?.name || 'Unknown Event'}</div>
                        <div className="text-xs text-gray-500">{payment.registrationData?.name || 'Unknown Participant'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">+Rs. {payment.amount || 0}</div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {eventPayments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <FontAwesomeIcon icon={faDollarSign} className="h-8 w-8 text-gray-400 mb-2" />
                      <p>No event payments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-Order Payments Summary */}
      <div className="mb-8">
        <Card className="border-orange-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-orange-800 bg-orange-50 p-4 rounded-t-lg border-b border-orange-200">
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faReceipt} className="mr-3" />
              Pre-Order Payments Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Total Pre-Order Expenses</h4>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  Rs. {preOrderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  From {preOrderPayments.length} completed payments
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Recent Pre-Order Payments</h4>
                <div className="space-y-2">
                  {preOrderPayments.slice(0, 3).map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <div className="font-medium text-sm">{payment.supplierId?.name || 'Unknown Supplier'}</div>
                        <div className="text-xs text-gray-500">{payment.paymentMethod || 'Payment'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">-Rs. {payment.amount || 0}</div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {preOrderPayments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <FontAwesomeIcon icon={faReceipt} className="h-8 w-8 text-gray-400 mb-2" />
                      <p>No pre-order payments found</p>
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
