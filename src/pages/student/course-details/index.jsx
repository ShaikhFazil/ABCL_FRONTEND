import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  captureAndFinalizePaymentService,
  checkCoursePurchaseInfoService,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle,   Calendar, 
  Users, 
  Star, 
  Target, 
  BookOpen, 
  ListOrdered, 
  Download, 
  Award, 
  Infinity, 
  Clock, 
  ChevronRight, 
  ShoppingCart, 
  ShieldCheck, 
  Facebook, 
  Twitter, 
  Bookmark, 
  X  } from "lucide-react";

import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [isAlreadyPurchased, setIsAlreadyPurchased] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  async function fetchStudentViewCourseDetails() {
  const purchaseInfo = await checkCoursePurchaseInfoService(
    currentCourseDetailsId,
    auth?.user?._id
  );

  if (purchaseInfo?.success && purchaseInfo?.data) {
    navigate(`/course-progress/${currentCourseDetailsId}`);
    return;
  }

  if (purchaseInfo?.success && purchaseInfo?.data) {
  setIsCoursePurchased(true);
}


  const response = await fetchStudentViewCourseDetailsService(
    currentCourseDetailsId
  );

  if (response?.success) {
    setStudentViewCourseDetails(response?.data);
  } else {
    setStudentViewCourseDetails(null);
  }

  setLoadingState(false);
}

useEffect(() => {
  async function checkPurchaseStatus() {
    if (currentCourseDetailsId && auth?.user?._id) {
      try {
        const response = await checkCoursePurchaseInfoService(
          currentCourseDetailsId,
          auth.user._id
        );
        
        if (response?.success) {
          setIsAlreadyPurchased(response.data);
        }
      } catch (error) {
        console.error("Error checking purchase status:", error);
      }
    }
  }
  
  checkPurchaseStatus();
}, [currentCourseDetailsId, auth?.user?._id]);


  function handleSetFreePreview(getCurrentVideoInfo) {
    console.log(getCurrentVideoInfo);
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  // StudentViewCourseDetailsPage.jsx - Updated handleCreatePayment function
async function handleCreatePayment() {
  setIsProcessingPayment(true);
  
  const paymentPayload = {
    userId: auth?.user?._id,
    userName: auth?.user?.userName,
    userEmail: auth?.user?.userEmail,
    orderStatus: "pending",
    paymentMethod: "razorpay",
    paymentStatus: "initiated",
    orderDate: new Date(),
    paymentId: "",
    payerId: "",
    instructorId: studentViewCourseDetails?.instructorId,
    instructorName: studentViewCourseDetails?.instructorName,
    courseImage: studentViewCourseDetails?.image,
    courseTitle: studentViewCourseDetails?.title,
    courseId: studentViewCourseDetails?._id,
    coursePricing: studentViewCourseDetails?.pricing,
  };

  console.log("Payment payload:", paymentPayload);
  
  try {
    const response = await createPaymentService(paymentPayload);
    console.log("Create payment response:", response);

    if (response.success) {
      const { razorpayOrder, orderId, key } = response.data;
      
      console.log("Razorpay order created:", razorpayOrder);
      console.log("Order ID:", orderId);
      console.log("Razorpay key:", key);
      
      // Store order ID for verification
      sessionStorage.setItem("currentOrderId", JSON.stringify(orderId));

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        console.error("Razorpay SDK not loaded");
        alert("Payment system not loaded. Please refresh the page.");
        setIsProcessingPayment(false);
        return;
      }

      // Razorpay checkout options
      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Learning Platform",
        description: studentViewCourseDetails?.title,
        order_id: razorpayOrder.id,
        handler: async function (paymentResponse) {
          console.log("Payment handler called with:", paymentResponse);
          
          try {
            // Verify payment on your server
            const verifyResponse = await captureAndFinalizePaymentService({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: orderId
            });

            console.log("Verify response:", verifyResponse);

            if (verifyResponse?.success) {
              sessionStorage.removeItem("currentOrderId");
              console.log("Payment successful, redirecting...");
              
              // Force reload to update course status
              setTimeout(() => {
                window.location.href = "/student-courses";
              }, 1000);
            } else {
              console.error("Payment verification failed:", verifyResponse?.message);
              alert(`Payment verification failed: ${verifyResponse?.message || "Unknown error"}`);
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
            alert("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: auth?.user?.userName,
          email: auth?.user?.userEmail,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            setIsProcessingPayment(false);
          }
        }
      };

      // Initialize Razorpay checkout
      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
        
        // Handle payment failure
        rzp.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error);
          alert(`Payment failed: ${response.error.description || "Unknown error"}`);
          setIsProcessingPayment(false);
        });
        
      } catch (rzpError) {
        console.error("Error creating Razorpay instance:", rzpError);
        alert("Error initializing payment. Please try again.");
        setIsProcessingPayment(false);
      }
    } else {
      console.error("Create payment service failed:", response.message);
      alert(`Payment creation failed: ${response.message || "Unknown error"}`);
      setIsProcessingPayment(false);
    }
  } catch (error) {
    console.error("Payment error:", error);
    alert("Payment processing error. Please try again.");
    setIsProcessingPayment(false);
  }
}

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setCurrentCourseDetailsId(null),
        setCoursePurchaseId(null);
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
<div className="max-w-7xl mx-auto px-4 py-6">
  {/* Hero Header Section - Compact */}
  <div className="bg-gradient-to-r from-gray-900 to-violet-900 text-white rounded-xl mb-6 p-6">
    <div className="max-w-4xl">
      {/* Course Category Badge */}
      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
        <span className="text-xs font-medium">
          {studentViewCourseDetails?.category || "Course"}
        </span>
      </div>
      
      {/* Course Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        {studentViewCourseDetails?.title}
      </h1>
      
      {/* Subtitle */}
      <p className="text-base md:text-lg text-gray-200 mb-6">
        {studentViewCourseDetails?.subtitle}
      </p>
      
      {/* Course Meta Info - Compact */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="font-bold text-white text-sm">
              {studentViewCourseDetails?.instructorName?.charAt(0) || "I"}
            </span>
          </div>
          <span className="font-medium">{studentViewCourseDetails?.instructorName}</span>
        </div>
        
        <div className="w-px h-4 bg-white/20"></div>
        
        {/* Date */}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-300" />
          <span>{studentViewCourseDetails?.date?.split("T")[0]}</span>
        </div>
        
        <div className="w-px h-4 bg-white/20"></div>
        
        {/* Language */}
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4 text-gray-300" />
          <span>{studentViewCourseDetails?.primaryLanguage}</span>
        </div>
        
        <div className="w-px h-4 bg-white/20"></div>
        
        {/* Students */}
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-300" />
          <span>{studentViewCourseDetails?.students?.length || 0} students</span>
        </div>
      </div>
      
      {/* Rating & Level Badges - Compact */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
          <div className="flex">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>
          <span className="text-sm font-medium">4.8</span>
        </div>
        
        <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
          {studentViewCourseDetails?.level || "All Levels"}
        </div>
      </div>
    </div>
  </div>

  {/* Main Content - Better spacing */}
  <div className="flex flex-col lg:flex-row gap-6">
    {/* Left Column - Course Content */}
    <main className="flex-grow space-y-6 lg:w-9">
      {/* What You'll Learn Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-xl font-semibold">What you'll learn</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentViewCourseDetails?.objectives.split(",").map((objective, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2 mt-0.5" />
                <span className="text-gray-700 text-sm">{objective.trim()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Description Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl font-semibold">Course Description</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-sm leading-relaxed">
            {studentViewCourseDetails?.description}
          </p>
        </CardContent>
      </Card>

      {/* Course Curriculum Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-xl font-semibold">
              Course Curriculum • {studentViewCourseDetails?.curriculum?.length || 0} lectures
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {studentViewCourseDetails?.curriculum?.map((curriculumItem, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg border ${
                  curriculumItem?.freePreview
                    ? "hover:bg-purple-50 cursor-pointer border-purple-200"
                    : "bg-gray-50 border-gray-200"
                }`}
                onClick={curriculumItem?.freePreview ? () => handleSetFreePreview(curriculumItem) : null}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  curriculumItem?.freePreview
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {curriculumItem?.freePreview ? (
                    <PlayCircle className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-sm text-gray-800">
                    {curriculumItem?.title}
                  </p>
                  {curriculumItem?.freePreview && (
                    <span className="text-xs text-purple-600 font-medium">Free preview</span>
                  )}
                </div>
                {!curriculumItem?.freePreview && !isAlreadyPurchased && (
                  <span className="text-xs text-gray-500 font-medium">Locked</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>

    {/* Right Column - Sidebar - More compact */}
    <aside className="lg:w-96">
      <div className="sticky top-6 space-y-4">
        {/* Preview Video Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
              <VideoPlayer
                url={
                  getIndexOfFreePreviewUrl !== -1
                    ? studentViewCourseDetails?.curriculum[getIndexOfFreePreviewUrl]?.videoUrl
                    : ""
                }
                width="100%"
                height="100%"
              />
              {!getIndexOfFreePreviewUrl && (
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <PlayCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm text-center">Select a free preview lecture</p>
                </div>
              )}
            </div>
            
            {/* Price Section */}
            <div className="p-5">
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-1">One-time payment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${studentViewCourseDetails?.pricing}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${(studentViewCourseDetails?.pricing * 1.5).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    33% OFF
                  </span>
                </div>
              </div>
              
              {/* Purchase Button */}
              <Button
                onClick={handleCreatePayment}
                disabled={isProcessingPayment || isAlreadyPurchased}
                size="lg"
                className={`w-full ${
                  isAlreadyPurchased
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : isAlreadyPurchased ? (
                  "Go to Course"
                ) : (
                  "Enroll Now"
                )}
              </Button>
              
              {/* Money Back Guarantee */}
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-800 font-medium">30-Day Money-Back Guarantee</p>
                </div>
              </div>
              
              {/* Features List */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Full lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Access on mobile and TV</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  </div>

  {/* Preview Dialog - Simplified */}
  <Dialog
    open={showFreePreviewDialog}
    onOpenChange={() => {
      setShowFreePreviewDialog(false);
      setDisplayCurrentVideoFreePreview(null);
    }}
  >
    <DialogContent className="max-w-2xl p-0">
      <div className="aspect-video bg-black">
        <VideoPlayer
          url={displayCurrentVideoFreePreview}
          width="100%"
          height="100%"
        />
      </div>
      
      <div className="p-6">
        <DialogHeader>
          <DialogTitle>Course Preview</DialogTitle>
          <p className="text-sm text-gray-500">Free preview lectures</p>
        </DialogHeader>
        
        <div className="mt-4 space-y-2">
          {studentViewCourseDetails?.curriculum
            ?.filter((item) => item.freePreview)
            .map((filteredItem, index) => (
              <div
                key={index}
                onClick={() => handleSetFreePreview(filteredItem)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <PlayCircle className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{filteredItem?.title}</p>
                  <p className="text-xs text-gray-500">Free preview</p>
                </div>
              </div>
            ))}
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            className="w-full"
            onClick={() => {
              setShowFreePreviewDialog(false);
              handleCreatePayment();
            }}
          >
            Enroll Now for Full Access
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</div>
  );
}

export default StudentViewCourseDetailsPage;
