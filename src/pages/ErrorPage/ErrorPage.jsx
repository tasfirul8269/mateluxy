import { FaHome, FaSadTear } from "react-icons/fa";
import { Link } from "react-router-dom";

const ErrorPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 flex items-center justify-center p-6 text-white">
    <div className="text-center max-w-2xl">
      {/* Animated 404 */}
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-9xl font-bold mr-2 animate__animated animate__bounceIn">4</h1>
        <div className="w-28 h-28 rounded-full bg-white bg-opacity-20 flex items-center justify-center animate__animated animate__heartBeat animate__infinite">
          <FaSadTear className="text-6xl text-yellow-300" />
        </div>
        <h1 className="text-9xl font-bold ml-2 animate__animated animate__bounceIn">4</h1>
      </div>

      {/* Title & Message */}
      <h2 className="text-4xl font-bold mb-4 animate__animated animate__fadeInUp animate__delay-1s">
        Lost in Space?
      </h2>
      <p className="text-xl mb-8 opacity-90 animate__animated animate__fadeInUp animate__delay-1s">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Back Home Button with Link */}
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 bg-white text-blue-900 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate__animated animate__fadeInUp animate__delay-2s"
      >
        <FaHome className="mr-2" />
        Back to Home
      </Link>

      {/* Floating Stars Animation */}
      <div className="mt-16 flex justify-center space-x-8 opacity-70">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full bg-white animate__animated animate__bounce animate__infinite`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default ErrorPage;