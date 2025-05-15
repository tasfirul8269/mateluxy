import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'animate.css';

const ImageCarousel = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 pt-32 md:pt-0">
      <div className="w-[90%]">
        <Swiper
          modules={[Navigation]}
          navigation
          loop={true}
          speed={800}
          className="mySwiper"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="flex flex-col md:flex-row gap-1 animate__animated animate__fadeIn">
              <img
                src="https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg"
                alt="Image 1"
                className=" w-full md:w-1/2 object-cover h-[400px] "
              />
              <img
                src="https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg"
                alt="Image 2"
                className=" w-full md:w-1/2 object-cover h-[400px] "
              />
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="flex flex-col md:flex-row gap-1 animate__animated animate__fadeIn">
              <img
                src="https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg"
                alt="Image 3"
                className=" w-full md:w-1/2 object-cover h-[400px] "
              />
              <img
                src="https://i.ibb.co.com/xSfmXX5Y/jason-dent-w3e-Fhq-Xjk-ZE-unsplash.jpg"
                alt="Image 4"
                className=" w-full md:w-1/2 object-cover h-[400px] "
              />
            </div>
          </SwiperSlide>

          {/* Add more <SwiperSlide> if needed */}

        </Swiper>
      </div>
    </div>
  );
};

export default ImageCarousel;
