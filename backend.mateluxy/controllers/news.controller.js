import News from '../models/news.model.js';
import { errorHandler } from '../utils/erros.js';

// Get all news articles
export const getAllNews = async (req, res, next) => {
  try {
    const { category, featured, limit } = req.query;
    
    let query = {};
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by featured if provided
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Create the base query
    let newsQuery = News.find(query).sort({ createdAt: -1 });
    
    // Apply limit if provided
    if (limit) {
      newsQuery = newsQuery.limit(parseInt(limit));
    }
    
    const news = await newsQuery;
    
    res.status(200).json(news);
  } catch (error) {
    next(errorHandler(500, "Error retrieving news articles"));
  }
};

// Get a single news article by ID
export const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return next(errorHandler(404, "News article not found"));
    }
    
    res.status(200).json(news);
  } catch (error) {
    next(errorHandler(500, "Error retrieving news article"));
  }
};

// Get a single news article by slug
export const getNewsBySlug = async (req, res, next) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    
    if (!news) {
      return next(errorHandler(404, "News article not found"));
    }
    
    res.status(200).json(news);
  } catch (error) {
    next(errorHandler(500, "Error retrieving news article"));
  }
};

// Create a new news article
export const createNews = async (req, res, next) => {
  try {
    console.log('Creating news with data:', req.body);
    
    // Create a new news article
    const newNews = new News(req.body);
    console.log('News model created:', newNews);
    
    // Save the news article
    const savedNews = await newNews.save();
    console.log('News saved successfully:', savedNews);
    
    res.status(201).json(savedNews);
  } catch (error) {
    console.error('Error in createNews:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      return next(errorHandler(400, error.message || "Validation error while creating news"));
    }
    
    next(errorHandler(500, error.message || "Error creating news article"));
  }
};

// Update a news article
export const updateNews = async (req, res, next) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedNews) {
      return next(errorHandler(404, "News article not found"));
    }
    
    res.status(200).json(updatedNews);
  } catch (error) {
    next(errorHandler(500, "Error updating news article"));
  }
};

// Delete a news article
export const deleteNews = async (req, res, next) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    
    if (!deletedNews) {
      return next(errorHandler(404, "News article not found"));
    }
    
    res.status(200).json({ message: "News article deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting news article"));
  }
}; 