const generatePhonePePayload = (orderData, callbackUrl) => {
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: `ORDER_${Date.now()}`,
      amount: orderData.totalAmount * 100, // Amount in paise
      callbackUrl,
      mobileNumber: orderData.addressInfo.phone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };
  
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHash('sha256')
      .update(base64Payload + process.env.PHONEPE_API_KEY)
      .digest('hex');
  
    return {
      request: base64Payload,
      signature: `${signature}###1`
    };
  };