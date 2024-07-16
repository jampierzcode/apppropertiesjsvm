// SharedDataContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const SharedDataContext = createContext();

export const useSharedData = () => {
  return useContext(SharedDataContext);
};

export const SharedDataProvider = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [webData, setWebData] = useState([]);

  const fetchWebData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/configwebbybusiness/1`);
      const data = response.data;
      console.log(data);
      if (data.length === 0) {
        setWebData([]);
      } else {
        setWebData(data);
      }
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };
  // Esta llamada inicial se ejecuta una vez al montar el componente

  useEffect(() => {
    fetchWebData();
  }, []);

  return (
    <SharedDataContext.Provider value={webData}>
      {children}
    </SharedDataContext.Provider>
  );
};
