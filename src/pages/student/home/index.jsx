import { courseCategories } from "@/config";
import banner from "../../../../public/banner-img.png";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState, useRef } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Users, Clock, ArrowRight, PlayCircle } from "lucide-react";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef(null);
  
  // Auto slide interval
  const [autoSlide, setAutoSlide] = useState(true);

  const carouselSlides = [
    {
      title: "Learn From Industry Experts",
      description: "Access courses taught by professionals with real-world experience",
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      image: "https://res.cloudinary.com/dr2krdnae/image/upload/v1769934479/lbopabt9qwkbffowdt6i.png",
    },
    {
      title: "Interactive Learning Experience",
      description: "Engage with hands-on projects and interactive content",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      image: banner,
    },
    {
      title: "Flexible Learning Schedule",
      description: "Learn at your own pace, anytime, anywhere",
      bgColor: "bg-gradient-to-r from-purple-50 to-pink-50",
      image: banner,
    },
    {
      title: "Career-Ready Skills",
      description: "Build skills that employers are looking for",
      bgColor: "bg-gradient-to-r from-orange-50 to-yellow-50",
      image: banner,
    },
  ];

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  // Carousel functions
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto slide effect
  useEffect(() => {
    let interval;
    if (autoSlide) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoSlide, currentSlide]);

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="relative h-[500px] md:h-[600px] lg:h-[500px] overflow-hidden"
        >
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                index === currentSlide
                  ? "translate-x-0 opacity-100"
                  : index < currentSlide
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              }`}
            >
              <div className={`${slide.bgColor} w-full h-full`}>
                <div className="container mx-auto px-4 lg:px-8 h-full">
                  <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 lg:gap-12">
                    {/* Text Content */}
                    <div className="lg:w-1/2 text-center lg:text-left space-y-6 animate-fadeInUp">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        <span className="block">{slide.title.split(" ")[0]}</span>
                        <span className="block text-primary mt-2">
                          {slide.title.split(" ").slice(1).join(" ")}
                        </span>
                      </h1>
                      <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Button 
                          size="lg" 
                          className="group animate-bounce-slow"
                          onClick={() => navigate("/courses")}
                        >
                          Explore Courses
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => navigate("/student-courses")}
                        >
                          <PlayCircle className="mr-2 h-5 w-5" />
                          My Learning
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Content */}
                    <div className="lg:w-1/2 relative">
                      <div className="relative animate-float">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full max-w-lg mx-auto rounded-b-2xl transform hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-2xl animate-pulse-slow">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-lg">10k+</p>
                              <p className="text-sm text-gray-600">Active Learners</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            onMouseEnter={() => setAutoSlide(false)}
            onMouseLeave={() => setAutoSlide(true)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
            onMouseEnter={() => setAutoSlide(false)}
            onMouseLeave={() => setAutoSlide(true)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="bg-white border-t border-b">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
              <div className="text-center animate-fadeIn" style={{animationDelay: '100ms'}}>
                <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
                <p className="text-sm md:text-base text-gray-600">Courses</p>
              </div>
              <div className="text-center animate-fadeIn" style={{animationDelay: '200ms'}}>
                <p className="text-2xl md:text-3xl font-bold text-primary">100+</p>
                <p className="text-sm md:text-base text-gray-600">Expert Instructors</p>
              </div>
              <div className="text-center animate-fadeIn" style={{animationDelay: '300ms'}}>
                <p className="text-2xl md:text-3xl font-bold text-primary">50k+</p>
                <p className="text-sm md:text-base text-gray-600">Students</p>
              </div>
              <div className="text-center animate-fadeIn" style={{animationDelay: '400ms'}}>
                <p className="text-2xl md:text-3xl font-bold text-primary">98%</p>
                <p className="text-sm md:text-base text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-12 px-4 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-10 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Course Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of courses across different domains and skill levels
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {courseCategories.map((categoryItem, index) => (
              <div
                key={categoryItem.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="text-xl font-bold">{categoryItem.icon || "📚"}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {categoryItem.label}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Master skills in {categoryItem.label.toLowerCase()} with expert guidance
                  </p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group/btn w-full justify-between mt-4"
                    onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
                  >
                    Explore
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 px-4 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              Popular Courses
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked courses to kickstart your learning journey
            </p>
          </div>
          
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {studentViewCoursesList.slice(0, 8).map((courseItem, index) => (
                <div
                  key={courseItem?._id}
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp cursor-pointer"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  {/* Course Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={courseItem?.image}
                      alt={courseItem?.title}
                      className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      {courseItem?.level || "Beginner"}
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white p-4 rounded-full shadow-lg">
                        <PlayCircle className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {courseItem?.category || "General"}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">4.8</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {courseItem?.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      By {courseItem?.instructorName}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{courseItem?.curriculum?.length || 10} lessons</span>
                      </div>
                      <p className="font-bold text-lg text-primary">
                        ${courseItem?.pricing}
                        {courseItem?.originalPrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">
                            ${courseItem.originalPrice}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No courses available</h3>
              <p className="text-gray-600">Check back soon for new courses!</p>
            </div>
          )}
          
          {/* View All Button */}
          {studentViewCoursesList && studentViewCoursesList.length > 0 && (
            <div className="text-center mt-12 animate-fadeInUp">
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/courses")}
                className="group"
              >
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Learning Journey Today
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of learners who have transformed their careers with our courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate("/courses")}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
               className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate("/student-courses")}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default StudentHomePage;