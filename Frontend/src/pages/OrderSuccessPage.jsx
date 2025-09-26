import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        
        <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. We have received your order and will process it shortly.
        </p>

        {orderId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                <strong>Order ID:</strong> {orderId}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You will receive a confirmation email shortly with your order details.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-x-4">
          <Link to="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
