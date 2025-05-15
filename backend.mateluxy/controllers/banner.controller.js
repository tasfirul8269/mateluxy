import Banner from "../models/banner.model.js";
import { errorHandler } from "../utils/erros.js";

// Get all banners
export const getBanners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = type ? { type, active: true } : { active: true };
    
    const banners = await Banner.find(query).sort({ order: 1 });
    res.status(200).json(banners);
  } catch (error) {
    next(error);
  }
};

// Get a single banner by ID
export const getBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return next(errorHandler(404, "Banner not found"));
    }
    res.status(200).json(banner);
  } catch (error) {
    next(error);
  }
};

// Create a new banner
export const createBanner = async (req, res, next) => {
  try {
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    next(error);
  }
};

// Update a banner
export const updateBanner = async (req, res, next) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedBanner) {
      return next(errorHandler(404, "Banner not found"));
    }
    
    res.status(200).json(updatedBanner);
  } catch (error) {
    next(error);
  }
};

// Delete a banner
export const deleteBanner = async (req, res, next) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!deletedBanner) {
      return next(errorHandler(404, "Banner not found"));
    }
    
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    next(error);
  }
};
