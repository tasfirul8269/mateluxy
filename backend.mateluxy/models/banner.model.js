import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["home", "offplan"],
      default: "home"
    },
    image: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    buttonText1: {
      type: String,
      default: "Learn More"
    },
    buttonLink1: {
      type: String,
      default: "#"
    },
    buttonText2: {
      type: String,
      default: "Explore Properties"
    },
    buttonLink2: {
      type: String,
      default: "/properties"
    },
    order: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
