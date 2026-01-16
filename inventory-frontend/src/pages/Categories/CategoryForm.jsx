// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { categoryAPI } from '../../services/api';
// import { useAuth } from '../../contexts/AuthContext';

// const CategoryForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState('');
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: ''
//   });

//   useEffect(() => {
//     if (id) {
//       fetchCategory();
//     }
//   }, [id]);

//   const fetchCategory = async () => {
//     try {
//       const response = await categoryAPI.getById(id);
//       const category = response.data.category;
//       setFormData({
//         name: category.name,
//         description: category.description || ''
//       });
//     } catch (error) {
//       console.error('Error fetching category:', error);
//       navigate('/categories');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear errors when user types
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//     if (success) setSuccess('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Check permissions
//     if (user?.role !== 'admin' && user?.role !== 'manager') {
//       setErrors({ general: 'You do not have permission to manage categories' });
//       return;
//     }
    
//     setLoading(true);
//     setErrors({});
//     setSuccess('');

//     try {
//       if (id) {
//         await categoryAPI.update(id, formData);
//         setSuccess('Category updated successfully!');
//       } else {
//         await categoryAPI.create(formData);
//         setSuccess('Category created successfully!');
        
//         // Redirect after 1.5 seconds
//         setTimeout(() => {
//           navigate('/categories');
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Error saving category:', error);
//       setErrors({ general: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-900">
//           {id ? 'Edit Category' : 'New Category'}
//         </h1>
//         <p className="text-gray-600">
//           {id ? 'Update category information' : 'Create a new product category'}
//         </p>
//       </div>

//       {errors.general && (
//         <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//           {errors.general}
//         </div>
//       )}

//       {success && (
//         <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
//           {success}
//           {id && <button onClick={() => navigate('/categories')} className="ml-4 text-green-800 underline">View Categories</button>}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <div className="space-y-6">
//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Category Name *
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="e.g., Electronics, Clothing, Books"
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               rows="4"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Describe what products belong to this category..."
//             />
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
//           <button
//             type="button"
//             onClick={() => navigate('/categories')}
//             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CategoryForm;