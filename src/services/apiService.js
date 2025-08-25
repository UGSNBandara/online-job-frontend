import axios from 'axios';
import { API_BASE_URL as BACKEND_URL, API_URL } from '../config';

// Configure axios defaults
axios.defaults.baseURL = BACKEND_URL;

// API service class
class ApiService {
  
  // Users API
  static async getUser(userId) {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  }

  static async updateUser(userId, userData) {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  }

  static async updateUserSkills(userId, skills) {
    const response = await axios.put(`${API_URL}/users/${userId}/skills`, { skills });
    return response.data;
  }

  static async uploadProfileImage(userId, file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await axios.post(`${API_URL}/users/${userId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Media API
  static getMediaUrl(mediaId) {
    return `${API_URL}/media/${mediaId}`;
  }

  // Projects API
  static async createProject(projectData) {
    const response = await axios.post(`${API_URL}/projects`, projectData);
    return response.data;
  }

  static async getProjects() {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  }

  static async getProject(projectId) {
    const response = await axios.get(`${API_URL}/projects/${projectId}`);
    return response.data;
  }

  static async updateProject(projectId, projectData) {
    const response = await axios.put(`${API_URL}/projects/${projectId}`, projectData);
    return response.data;
  }

  static async deleteProject(projectId) {
    const response = await axios.delete(`${API_URL}/projects/${projectId}`);
    return response.data;
  }

  // Experiences API
  static async createExperience(experienceData) {
    const response = await axios.post(`${API_URL}/experiences`, experienceData);
    return response.data;
  }

  static async getExperiences() {
    const response = await axios.get(`${API_URL}/experiences`);
    return response.data;
  }

  static async getExperience(experienceId) {
    const response = await axios.get(`${API_URL}/experiences/${experienceId}`);
    return response.data;
  }

  static async updateExperience(experienceId, experienceData) {
    const response = await axios.put(`${API_URL}/experiences/${experienceId}`, experienceData);
    return response.data;
  }

  static async deleteExperience(experienceId) {
    const response = await axios.delete(`${API_URL}/experiences/${experienceId}`);
    return response.data;
  }

  // Messages API
  static async createMessage(messageData) {
    const response = await axios.post(`${API_URL}/messages`, messageData);
    return response.data;
  }

  static async getUserMessages(userId) {
    const response = await axios.get(`${API_URL}/messages/user/${userId}`);
    return response.data;
  }

  static async getConversation(userId1, userId2) {
    const response = await axios.get(`${API_URL}/messages/conversation/${userId1}/${userId2}`);
    return response.data;
  }

  static async updateMessage(messageId, messageText) {
    const response = await axios.put(`${API_URL}/messages/${messageId}`, { message_text: messageText });
    return response.data;
  }

  static async deleteMessage(messageId) {
    const response = await axios.delete(`${API_URL}/messages/${messageId}`);
    return response.data;
  }

  // Posts API
  static async createPost(title, description, userId, images = []) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('user_id', userId);
    
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await axios.post(`${API_URL}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async getPosts(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await axios.get(`${API_URL}/posts?${params}`);
    return response.data;
  }

  static async getPost(postId) {
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    return response.data;
  }

  static async updatePost(postId, postData, newImages = [], deleteOldImages = false) {
    const formData = new FormData();
    
    Object.keys(postData).forEach(key => {
      formData.append(key, postData[key]);
    });

    newImages.forEach(image => {
      formData.append('images', image);
    });

    if (deleteOldImages) {
      formData.append('deleteOldImages', 'true');
    }

    const response = await axios.put(`${API_URL}/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Get posts by user ID
  static async getPostsByUserId(userId) {
    const response = await axios.get(`${API_URL}/posts/user/${userId}`);
    return response.data;
  }

  // Get wall posts (excluding current user's own and liked posts)
  static async getWallPosts(userId) {
    const response = await axios.get(`${API_URL}/posts/wall/${userId}`);
    return response.data;
  }

  // Like or unlike a post
  static async likePost(postId, userId) {
    const response = await axios.post(`${API_URL}/posts/${postId}/like`, { userId });
    return response.data;
  }

  // Delete a post
  static async deletePost(postId) {
    const response = await axios.delete(`${API_URL}/posts/${postId}`);
    return response.data;
  }

  // Job-related API calls
  static async createJob(jobData) {
    const response = await axios.post(`${API_URL}/jobs`, jobData);
    return response.data;
  }

  static async getAllJobs() {
    const response = await axios.get(`${API_URL}/jobs`);
    return response.data;
  }

  static async getJobById(jobId) {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  }

  static async updateJob(jobId, jobData) {
    const response = await axios.put(`${API_URL}/jobs/${jobId}`, jobData);
    return response.data;
  }

  static async deleteJob(jobId) {
    const response = await axios.delete(`${API_URL}/jobs/${jobId}`);
    return response.data;
  }
}

export default ApiService;
