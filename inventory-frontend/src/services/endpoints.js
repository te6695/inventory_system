import api from './api';

export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    console.log('Products API Response:', response.data); 
    return response.data;
  },

  getById: async (id) => {
    console.log('Fetching product with ID:', id); // Debug
    try {
      const response = await api.get(`/products/${id}`);
      console.log('Product response:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  create: async (data) => {
    console.log('Creating product with data:', data); // Debug
    try {
      const response = await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Create response:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    console.log('Updating product ID:', id, 'with data:', data); // Debug
    try {
      const response = await api.put(`/products/${id}`, data, {  // Fixed: POST → PUT
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update response:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};

export const transactionService = {
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  purchase: async (data) => {
    const response = await api.post('/transactions/purchase', data);
    return response.data;
  },

  sale: async (data) => {
    const response = await api.post('/transactions/sale', data);
    return response.data;
  },

  getDailyReport: async () => {
    const response = await api.get('/transactions/daily-report');
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getSalesChart: async (days = 30) => {
    const response = await api.get('/dashboard/sales-chart', { params: { days } });
    return response.data;
  },
};