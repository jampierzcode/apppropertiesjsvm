import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaAlignJustify } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSharedData } from "./SharedDataContext";

const NavigationPage = () => {
  const sharedData = useSharedData();

  const settings = {
    color_primary:
      sharedData.length === 0 ? "#000" : sharedData[0].color_primary,
    color_secondary:
      sharedData.length === 0 ? "#000" : sharedData[0].color_secondary,
    is_capa_fondo_portada:
      sharedData.length === 0 ? false : sharedData[0].is_capa_fondo_portada,
    color_fondo_portada:
      sharedData.length === 0 ? "#000" : sharedData[0].color_fondo_portada,
    color_capa_fondo_portada:
      sharedData.length === 0 ? "#000" : sharedData[0].color_capa_fondo_portada,
    portada: sharedData.length === 0 ? "" : sharedData[0].portada,
  };
  const [businessData, setBusinessData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/business`);
      console.log(response);
      const data = response.data;
      console.log(data);

      if (data.length === 0) {
        setBusinessData([]);
      } else {
        setBusinessData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };
  useEffect(() => {
    fetchBusinessData();
  }, [0]);
  const menu = [
    {
      icon: "-",
      name: "Home",
      url: "/",
    },
    {
      icon: "-",
      name: "Departamentos",
      url: "/busqueda/venta-de-departamento",
    },
    {
      icon: "-",
      name: "Casas",
      url: "/busqueda/venta-de-casa",
    },
    {
      icon: "-",
      name: "Oficinas",
      url: "/busqueda/venta-de-oficina",
    },
    {
      icon: "-",
      name: "Lotes",
      url: "/busqueda/venta-de-lote",
    },
  ];
  const [mobileMenu, setMobileMenu] = useState(false);
  const handleMobile = () => {
    setMobileMenu(!mobileMenu);
  };
  return (
    <header className="shadow fixed z-40 top-0 left-0 w-full bg-white">
      <div className="flex items-center justify-between  px-5 py-3 max-w-[1350px] mx-auto">
        <div className="logo w-[25%]">
          <Link to={"/"}>
            <img
              className="w-[90%] md:w-[70%] object-contain object-left"
              src={businessData.length !== 0 ? businessData.logo : "no-logo"}
              alt=""
            />
          </Link>
        </div>
        <div className="links-desktop hidden md:flex w-[50%]">
          <ul className="flex items-center justify-center">
            {menu.map((item, index) => {
              return (
                <Link
                  className="px-3 py-2 text-bold-font font-bold text-lg"
                  key={index}
                  to={item.url}
                >
                  {item.name}
                </Link>
              );
            })}
            <li></li>
          </ul>
        </div>
        <div
          className={`${
            mobileMenu ? "flex" : "hidden"
          } links-mobile left-0 right-0 fixed z-30 top-[75px] shadow-md`}
        >
          <ul className="w-full flex flex-col px-3 py-4 bg-gray-200">
            {menu.map((item, index) => {
              return (
                <Link
                  className="px-3 py-2 text-bold-font font-medium text-xs w-full"
                  key={index}
                  to={item.url}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              style={{ background: settings.color_primary }}
              className="px-3 py-2 rounded  text-white text-xs font-medium"
              to={"/login"}
            >
              Inicia session
            </Link>
            <li></li>
          </ul>
        </div>
        <div className="buttons-actions gap-3 items-center ">
          <button className="flex md:hidden" onClick={() => handleMobile()}>
            <FaAlignJustify />
          </button>
          <Link
            style={{ background: settings.color_primary }}
            className="hidden md:flex px-3 py-2 rounded  text-white font-medium text-sm"
            to={"/login"}
          >
            Inicia session
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavigationPage;
