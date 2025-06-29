import { create } from "zustand";
import axios from "axios";
const BASE = "https://codingassistant.onrender.com/"
// const BASE = "http://localhost:5000/";
export const userStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  sign: async (userData) => {
    if (!userData.username || !userData.email || !userData.password) {
      return { message: "Please enter all the fields" };
    }

    try {
      const response = await axios.post(`${BASE}signup`, userData);
      return response.data;
    } catch (error) {
      console.error(error);
      return { message: "Error occurred while signing up" };
    }
  },
  login: async (Udata) => {
    if (!Udata.email || !Udata.password) {
      return { message: "Please enter all the fields" };
    }
    try {
      const response = await axios.post(`${BASE}login`, Udata);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      return { message: "Error occurred while logging in" };
    }
  },
}));
