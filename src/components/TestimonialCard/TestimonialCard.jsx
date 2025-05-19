import { FaGoogle, FaHeart } from "react-icons/fa";
import 'animate.css';

const TestimonialCard = () => {
  return (
    <div className="animate__animated animate__fadeInUp w-full mx-auto  overflow-hidden p-6 space-y-4 mt-16">
      {/* Review Text */}
      <blockquote className="text-[#083819] text-center text-4xl italic font-semibold">
      "Mr Adrian, Such a great agent, helped me buy two properties, and I'm happy with all the procedures." Sajjad Ghanaat
      </blockquote>

      {/* Reviewer Name */}
      <p className="font-semibold text-gray-900">Sajjad Ghanaat</p>

      {/* Rating & Platform */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center space-x-2">
          <FaGoogle className="text-blue-500" />
          <span className="text-gray-600 text-2xl">Google Reviews</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-red-400 text-2xl">★</span>
            ))}
          </div>
        </div>

        <h1 className="text-5xl font-extralight">|</h1>

        {/* Feel❤ rating */}
        <div className="flex items-center space-x-1">
          <FaHeart className="text-red-500" />
          <span className="text-gray-600 text-2xl">feelo</span>
          <span className="text-red-400 text-2xl">★★★★★</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;