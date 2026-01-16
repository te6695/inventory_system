// import React, { useState, useEffect } from 'react';
// import { categoryAPI } from '../../services/api';
// import { 
//   PlusIcon, 
//   PencilIcon, 
//   TrashIcon,
//   ExclamationTriangleIcon,
//   TagIcon
// } from '@heroicons/react/24/outline';

// const CategoryList = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // Form state
//   const [showForm, setShowForm] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: ''
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const data = await categoryAPI.getAll();
//       setCategories(Array.isArray(data.categories) ? data.categories : []);
//       setError('');
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       setError('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!formData.name.trim()) {
//         throw new Error('Category name is required');
//       }

//       if (editingCategory) {
//         await categoryAPI.update(editingCategory.id, formData);
//         setSuccess('Category updated successfully!');
//       } else {
//         await categoryAPI.create(formData);
//         setSuccess('Category created successfully!');
//       }

//       // Reset form
//       setFormData({ name: '', description: '' });
//       setShowForm(false);
//       setEditingCategory(null);
      
//       // Refresh list
//       fetchCategories();
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     setFormData({
//       name: category.name,
//       description: category.description || ''
//     });
//     setShowForm(true);
//     setError('');
//     setSuccess('');
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this category?')) {
//       return;
//     }

//     try {
//       await categoryAPI.delete(id);
//       setSuccess('Category deleted successfully!');
//       fetchCategories();
//     } catch (error) {
//       setError(error.message || 'Failed to delete category');
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto">
//       <div className="mb-8">
//         <div className="flex items-center mb-4">
//           <TagIcon className="w-8 h-8 text-blue-600 mr-3" />
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
//             <p className="text-gray-600">Manage product categories</p>
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
//           {success}
//         </div>
//       )}

//       {/* Add Category Button */}
//       <div className="mb-6">
//         <button
//           onClick={() => {
//             setShowForm(!showForm);
//             setEditingCategory(null);
//             setFormData({ name: '', description: '' });
//             setError('');
//             setSuccess('');
//           }}
//           className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <PlusIcon className="w-5 h-5 mr-2" />
//           {showForm ? 'Cancel' : 'Add New Category'}
//         </button>
//       </div>

//       {/* Category Form */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//           <h2 className="text-lg font-semibold mb-4">
//             {editingCategory ? 'Edit Category' : 'Add New Category'}
//           </h2>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Category Name *
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="e.g., Electronics, Clothing, Food"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//                 rows="3"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Optional description..."
//               />
//             </div>

//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditingCategory(null);
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 {editingCategory ? 'Update Category' : 'Add Category'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Categories List */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             <p className="mt-2 text-gray-600">Loading categories...</p>
//           </div>
//         ) : categories.length === 0 ? (
//           <div className="p-8 text-center">
//             <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//               <TagIcon className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
//             <p className="text-gray-500 mb-4">Create your first category to organize products</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               <PlusIcon className="w-5 h-5 mr-2" />
//               Add First Category
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Category
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Description
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Products
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Created
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {categories.map((category) => (
//                   <tr key={category.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                           <TagIcon className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div className="text-sm font-medium text-gray-900">{category.name}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-500 max-w-xs truncate">
//                         {category.description || 'No description'}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
//                         {category.products_count || 0} products
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {category.created_at ? category.created_at.substring(0, 10) : 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleEdit(category)}
//                         className="text-blue-600 hover:text-blue-900 mr-3"
//                       >
//                         <PencilIcon className="w-4 h-4 inline mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(category.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <TrashIcon className="w-4 h-4 inline mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
        
//         <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//           <p className="text-sm text-gray-600">
//             Total Categories: {categories.length}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoryList;