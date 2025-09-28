import { create } from "zustand";
import { nanoid } from "nanoid";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const BASE = "http://localhost:5000/";
// const BASE = "http://localhost:5000/"

const roomStore = create((set) => ({
  room: null,
  roomCode: null,
  setRoom: (room) => set({ room }),
  generateCode: () => {
    const code = nanoid(8);
    set({ roomCode: code });
    return code;
  },
  userId : ()=>{
      try{
        const token = localStorage.getItem("token");
        return jwtDecode(token).userId;
      }
      catch{
        return null;
      }
    }, 
  join: async (roomCode) => {
    if (!roomCode) return { message: "Enter a room Code" };

    
    try {
      if (userId === null) {
        return { success: false, message: "User not found" };
      }
      const resp = await axios.post(`${BASE}join-room`, {
        roomCode: roomCode,
        userId: userId,
      });
      if (resp.data.success === false) {
        return { success: resp.data.success, message: resp.data.message };
      } else {
        set({ room: roomCode });
        localStorage.setItem("roomCode", roomCode);
        return { success: resp.data.success, message: resp.data.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "An error occurred" };
    }
  },

  create: async () => {
    try {
      // const uid = nanoid(4);
      if (userId === null) {
        return { message: "Please login first" };
      }
      const resp = await axios.post(`${BASE}create-room`, {
        userId: uid,
      });
      if (resp.data.success === false) {
        return { success: resp.data.success, message: resp.data.message };
      } else {
        const roomCode = resp.data.roomCode;
        set({ room: roomCode });
        localStorage.setItem("roomCode", roomCode);
        // console.log(localStorage.getItem("roomCode"));
        return { success: resp.data.success, message: resp.data.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "An error occurred" };
    }
  },
}));

export default roomStore;
