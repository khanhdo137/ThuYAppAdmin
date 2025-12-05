import apiService from './apiService';
import appointmentService from './appointmentService';
import authService from './authService';
import chatService from './chatService';
import { cloudinaryService } from './cloudinaryService';
import customerService from './customerService';
import dashboardService from './dashboardService';
import doctorService from './doctorService';
import feedbackService from './feedbackService';
import knnAnalysisService from './knnAnalysisService';
import medicalHistoryService from './medicalHistoryService';
import newsService from './newsService';
import petService from './petService';
import serviceService from './serviceService';
import userService from './userService';

export {
    apiService,
    appointmentService,
    authService,
    chatService,
    cloudinaryService,
    customerService,
    dashboardService,
    doctorService,
    feedbackService,
    knnAnalysisService,
    medicalHistoryService,
    newsService,
    petService,
    serviceService,
    userService
};

export default {
  auth: authService,
  api: apiService,
  chat: chatService,
  cloudinary: cloudinaryService,
  user: userService,
  pet: petService,
  appointment: appointmentService,
  customer: customerService,
  news: newsService,
  service: serviceService,
  doctor: doctorService,
  feedback: feedbackService,
  medicalHistory: medicalHistoryService,
  knnAnalysis: knnAnalysisService
}; 