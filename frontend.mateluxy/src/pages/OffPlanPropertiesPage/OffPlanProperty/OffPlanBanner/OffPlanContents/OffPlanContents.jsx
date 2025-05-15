import {
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBuilding,
} from "react-icons/fa";
import "animate.css";

const OffPlanContents = () => {
  const properties = [
    {
      name: "The Acres",
      location: "Dubailand",
      deliveryDate: "Dec. 2028",
      price: "AED 5,090,000",
      developer: "MERAAS",
      image:
        "https://i.ibb.co.com/tMyVpjdk/the-acres-hausandhaus-main-1-50fe8d0045.webp",
    },
    {
      name: "Serenia District",
      location: "Jumariah Islands",
      deliveryDate: "Dec. 2028",
      price: "AED 1,860,000",
      developer: "Palma Holding",
      image:
        "https://i.ibb.co.com/39dHgZNQ/serenia-district-jumeirah-islands-hausandhaus-101-c6273717cc.webp",
    },
    {
      name: "Palmiera The Oasis",
      location: "The Oasis",
      deliveryDate: "Dec. 2027",
      price: "AED 8,500,000",
      developer: "EMAAR",
      image:
        "https://i.ibb.co.com/0pRGvhSp/OASIS-PALMIERA-x-hausandhaus-1-e125317ee0.webp",
    },
    {
      name: "Orise by Beyond",
      location: "Dubai Maritime City",
      deliveryDate: "Mar. 2028",
      price: "AED 1,900,000",
      developer: "OIMINAT",
      image:
        "https://i.ibb.co.com/TB1DYX9h/orise-by-beyond-omniyat-hausandhaus-11-954e43c5d0.webp",
    },
  ];

  return (
    <div className=" px-4 py-12 animate__animated animate__fadeIn">
      <h1 className="text-3xl font-bold text-[#083819] mb-6">
        Browse our Off Plan properties
      </h1>

      <div className="space-y-8">
        {" "}
        {/* Changed to flex column for better ad handling */}
        {/* Split properties into chunks of 3 */}
        {Array.from({ length: Math.ceil(properties.length / 3) }).map(
          (_, chunkIndex) => {
            const startIndex = chunkIndex * 3;
            const chunk = properties.slice(startIndex, startIndex + 3);

            return (
              <div key={chunkIndex} className="space-y-8">
                {/* Property grid for this chunk */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {chunk.map((property, index) => (
                    <div
                      key={startIndex + index}
                      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 animate__animated animate__fadeInUp`}
                    >
                      {/* Property Image */}
                      <div className="h-48 overflow-hidden">
                        <img
                          src={property.image}
                          alt={property.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>

                      {/* Property Details */}
                      <div className="p-6 border border-gray-300">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {property.name}
                        </h2>
                        <p className="text-gray-600 mb-4 flex items-center">
                          <FaMapMarkerAlt className="mr-2" />{" "}
                          {property.location}
                        </p>

                        <div className="space-y-3 my-4">
                          <p className="text-gray-700 text-xs flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            <span className="font-bold">Delivery: </span>{" "}
                            {property.deliveryDate}
                          </p>
                          <p className="text-gray-700 text-xs flex items-center">
                            <FaMoneyBillWave className="mr-2" />
                            <span className="font-bold">Price from: </span>{" "}
                            {property.price}
                          </p>
                          <p className="text-gray-700 text-xs flex items-center">
                            <FaBuilding className="mr-2" />
                            <span className="font-bold">Developer: </span>{" "}
                            {property.developer}
                          </p>
                        </div>

                        <div className="border font-extralight border-gray-200"></div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 justify-between mt-6 pb-5">
                          <button className="flex items-center justify-center px-4 py-2 btn btn-outline rounded-md bg-gray-200 hover:text-white hover:bg-red-300 border-none transition flex-1">
                            <FaPhone className="mr-2" /> Call
                          </button>
                          <button className="flex items-center justify-center px-4 py-2 btn btn-outline rounded-md bg-gray-200 hover:text-white hover:bg-red-300 border-none transition flex-1">
                            <FaWhatsapp className="text-2xl" /> Whatsapp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default OffPlanContents;
