// src/pages/shopping-view/payment-redirect.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentRedirect() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const transactionId = searchParams.get('transactionId');
    
    if (code === 'PAYMENT_SUCCESS' && transactionId) {
      window.location.href = `/shop/phonepe-return?transactionId=${transactionId}`;
    } else {
      window.location.href = '/shop/payment-failed';
    }
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Processing Payment...</h1>
      <p>Redirecting to payment verification</p>
    </div>
  );
}

export default PaymentRedirect;