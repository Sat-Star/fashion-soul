import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPhonePePayment } from '@/store/shop/order-slice';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

function PhonePeReturnPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  
  // Directly get parameters from URL
  const transactionId = searchParams.get('transactionId');
  const status = searchParams.get('status');

  useEffect(() => {
    const handlePayment = async () => {
      try {
        // Immediate check for success status
        if (status === 'success') {
          // Verify payment through Redux
          await dispatch(verifyPhonePePayment(transactionId)).unwrap();
          
          // Clear temporary storage if needed
          sessionStorage.removeItem('currentOrderId');
          
          // Redirect to success page
          navigate('/shop/payment-success', {
            state: { transactionId },
            replace: true
          });
        } else {
          navigate('/shop/payment-failed', { replace: true });
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setErrorMessage(error.message || 'Payment verification failed');
        navigate('/shop/payment-failed', {
          state: { error: error.message },
          replace: true
        });
      }
    };

    // Trigger immediately when component mounts
    if (transactionId && status) {
      handlePayment();
    } else {
      navigate('/shop/payment-failed', { replace: true });
    }
  }, [transactionId, status, navigate, dispatch]);

  // Show loading state while processing
  return (
    <Card className="mt-10">
      <CardHeader>
        <div className="flex items-center justify-center gap-2">
          <ReloadIcon className="h-6 w-6 animate-spin" />
          <CardTitle>Verifying Payment</CardTitle>
        </div>
        <CardDescription className="text-center mt-4">
          Transaction ID: {transactionId}
        </CardDescription>
        {errorMessage && (
          <div className="text-red-500 text-center mt-4">{errorMessage}</div>
        )}
      </CardHeader>
    </Card>
  );
}

export default PhonePeReturnPage;