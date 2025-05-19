import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from '@/components/AdminPannel/ui/sonner';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../services/bannerService';
import { uploadFileToS3 } from '../../utils/s3Upload';
import { convertS3UrlToProxyUrl } from '../../utils/s3UrlConverter';

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    type: 'home',
    image: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText1: 'Learn More',
    buttonLink1: '#',
    buttonText2: 'Explore Properties',
    buttonLink2: '/properties',
    order: 0,
    active: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBanners();
      setBanners(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch banners');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingImage(true);
        setImageFile(file);
        
        // Create a temporary preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Upload file to S3
        const fileUrl = await uploadFileToS3(file, 'banners/');
        
        // Update form data with the S3 URL
        setFormData({
          ...formData,
          image: fileUrl
        });
        
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        type: banner.type,
        image: banner.image,
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        buttonText1: banner.buttonText1,
        buttonLink1: banner.buttonLink1,
        buttonText2: banner.buttonText2,
        buttonLink2: banner.buttonLink2,
        order: banner.order,
        active: banner.active
      });
      setImagePreview(banner.image.startsWith('data:') ? banner.image : convertS3UrlToProxyUrl(banner.image));
    } else {
      setEditingBanner(null);
      setFormData({
        type: 'home',
        image: '',
        title: '',
        subtitle: '',
        description: '',
        buttonText1: 'Learn More',
        buttonLink1: '#',
        buttonText2: 'Explore Properties',
        buttonLink2: '/properties',
        order: 0,
        active: true
      });
      setImagePreview('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setLoading(true);
      
      if (editingBanner) {
        await updateBanner(editingBanner._id, formData);
        toast.success('Banner updated successfully');
      } else {
        await createBanner(formData);
        toast.success('Banner created successfully');
      }
      
      fetchBanners();
      closeModal();
    } catch (error) {
      toast.error(editingBanner ? 'Failed to update banner' : 'Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        setLoading(true);
        await deleteBanner(id);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        toast.error('Failed to delete banner');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Banner Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openModal()}
          >
            <FiPlus className="mr-2" /> Add New Banner
          </motion.button>
        </div>

        {loading && <p className="text-center py-4">Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="px-2 py-1 text-xs bg-red-600 rounded-full uppercase">
                    {banner.type}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{banner.title}</h3>
                  <p className="text-sm text-white/80">{banner.subtitle}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      Order: {banner.order}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => openModal(banner)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => handleDelete(banner._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {banners.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No banners found</p>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              onClick={() => openModal()}
            >
              Create your first banner
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Banner Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      >
                        <option value="home">Home Page</option>
                        <option value="offplan">Off-Plan Page</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Order</label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Banner Image</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center">
                          <FiImage className="w-8 h-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">
                            Click to upload image
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      {imagePreview && (
                        <div className="relative w-32 h-32">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                            onClick={() => {
                              setImagePreview('');
                              setFormData({ ...formData, image: '' });
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="ml-2 text-sm text-blue-600">
                          Uploading image...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Subtitle</label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Button 1 Text</label>
                      <input
                        type="text"
                        name="buttonText1"
                        value={formData.buttonText1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Button 1 Link</label>
                      <input
                        type="text"
                        name="buttonLink1"
                        value={formData.buttonLink1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Button 2 Text</label>
                      <input
                        type="text"
                        name="buttonText2"
                        value={formData.buttonText2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Button 2 Link</label>
                      <input
                        type="text"
                        name="buttonLink2"
                        value={formData.buttonLink2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      name="active"
                      id="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="active" className="text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  );
};

export default BannerPage;
