import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      axios.post('http://localhost:5000/api/verify', { reference })
        .then(res => {
          setStatus(res.data.status);
        })
        .catch(() => {
          setStatus('error');
        });
    } else {
      setStatus('no_reference');
    }
  }, [searchParams]);

  if (status === 'loading') return <p>Verifying payment...</p>;
  if (status === 'success') return <h2>✅ Payment Successful!</h2>;
  if (status === 'failed') return <h2>❌ Payment Failed.</h2>;
  if (status === 'no_reference') return <h2>❗ No reference found in URL.</h2>;
  return <h2>⚠️ Something went wrong while verifying payment.</h2>;
};

export default PaymentResult;
