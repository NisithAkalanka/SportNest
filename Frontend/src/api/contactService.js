// File: frontend/src/api/contactService.js
import api from '@/api'; // ඔබගේ මධ්‍යගත Axios instance එක

const submitContactForm = (formData) => {
  return api.post('/contact', formData);
};

const contactService = {
  submitContactForm,
  // Admin සඳහා get සහ delete functions පසුව මෙහි එකතු කළ හැක
};

export default contactService;