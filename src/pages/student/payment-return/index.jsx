import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing payment... Please wait");

  useEffect(() => {
    // Check for Razorpay payment parameters in URL (if any)
    const params = new URLSearchParams(location.search);
    const razorpayOrderId = params.get("razorpay_order_id");
    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpaySignature = params.get("razorpay_signature");

    // If we have Razorpay parameters in URL (e.g., from failed redirect)
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      async function verifyPayment() {
        try {
          const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
          
          const response = await captureAndFinalizePaymentService({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            orderId: orderId
          });

          if (response?.success) {
            setStatus("success");
            setMessage("Payment successful! Redirecting to your courses...");
            sessionStorage.removeItem("currentOrderId");
            
            // Redirect after 2 seconds
            setTimeout(() => {
              navigate("/student-courses");
            }, 2000);
          } else {
            setStatus("error");
            setMessage(response?.message || "Payment verification failed");
            
            // Redirect back after 3 seconds
            setTimeout(() => {
              navigate(-1); // Go back to course details
            }, 3000);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          setStatus("error");
          setMessage("Error verifying payment. Please try again.");
          
          setTimeout(() => {
            navigate(-1); // Go back to course details
          }, 3000);
        }
      }

      verifyPayment();
    } else {
      // No Razorpay parameters - this page might have been accessed directly
      setStatus("info");
      setMessage("No payment details found. Redirecting to courses...");
      
      // Check if there's a pending order in session storage
      const orderId = sessionStorage.getItem("currentOrderId");
      if (orderId) {
        setMessage("Payment may still be processing. Please check your orders.");
      }
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/student-courses");
      }, 3000);
    }
  }, [location, navigate]);

  // Determine styling based on status
  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  // Status icon
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "⏳";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full ${getStatusStyles()}`}>
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">{getStatusIcon()}</div>
          <CardTitle>{message}</CardTitle>
          <p className="text-sm mt-2 opacity-75">
            {status === "processing" && "This may take a few moments..."}
            {status === "success" && "You will be redirected shortly."}
            {status === "error" && "Please contact support if the issue persists."}
            {status === "info" && "Please check your orders page for status."}
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;
