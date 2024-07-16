import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaFacebook,
  FaMailBulk,
  FaTwitter,
  FaVoicemail,
  FaWhatsapp,
} from "react-icons/fa";
import { FaMailchimp } from "react-icons/fa6";
import {
  IoLocation,
  IoLocationOutline,
  IoMail,
  IoMailOutline,
  IoPhonePortrait,
  IoPhonePortraitOutline,
} from "react-icons/io5";
import { useSharedData } from "./SharedDataContext";

const FooterPage = () => {
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
  // compartir botones
  const shareOnFacebook = () => {
    const url =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(window.location.href);
    window.open(url, "_blank", "width=600,height=400");
  };
  const shareOnWhatsApp = () => {
    const text = `Hola amig@ comparto este portal imobiliario *${businessData.nombre_razon}*`;
    const url =
      "https://api.whatsapp.com/send?text=" +
      text +
      " " +
      encodeURIComponent(window.location.href);
    window.open(url, "_blank", "width=600,height=400");
  };
  const shareOnTwitter = () => {
    const text = encodeURIComponent("Check out this awesome website!");
    const url =
      "https://twitter.com/intent/tweet?text=" +
      text +
      "&url=" +
      encodeURIComponent(window.location.href);
    window.open(url, "_blank", "width=600,height=400");
  };
  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out this awesome website!");
    const body = encodeURIComponent(
      "I found this interesting website and wanted to share it with you: " +
        window.location.href
    );
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
  };
  return (
    <div
      style={{ background: settings.color_primary }}
      className="w-full px-3 py-[40px] text-white"
    >
      <div className="max-w-[1180px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="w-full">
            <label
              htmlFor="visitanos"
              className="text-sm font-bold mb-4 inline-block"
            >
              VISITANOS
            </label>
            <ul className="flex flex-col gap-2">
              <li className="w-full flex gap-1 items-center font-medium text-sm">
                <IoLocation /> <p>{businessData?.direccion}</p>
              </li>
              <li className="w-full flex gap-1 items-center font-medium text-sm">
                <IoPhonePortrait /> <p>{businessData?.phone_contact}</p>
              </li>
              <li className="w-full flex gap-1 items-center font-medium text-sm">
                <IoMail /> <p>{businessData?.email}</p>
              </li>
            </ul>
          </div>
          <div className="w-full">
            <label
              htmlFor="visitanos"
              className="text-sm font-bold mb-4 inline-block"
            >
              COMPARTIR EN REDES SOCIALES
            </label>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => shareOnFacebook()}
                className="flex bg-[#3b5998] rounded-md overflow-hidden cursor-pointer"
              >
                <span className="block p-3">
                  <FaFacebook />
                </span>
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,rgba(0,0,0,.12),transparent)",
                  }}
                  className="p-3 text-sm font-bold"
                >
                  Facebook
                </div>
              </div>
              <div
                onClick={() => shareOnWhatsApp()}
                className="flex bg-[#25d366] rounded-md overflow-hidden cursor-pointer"
              >
                <span className="block p-3">
                  <FaWhatsapp />
                </span>
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,rgba(0,0,0,.12),transparent)",
                  }}
                  className="p-3 text-sm font-bold"
                >
                  WhatsApp
                </div>
              </div>
              <div
                onClick={() => shareOnTwitter()}
                className="flex bg-[#1da1f2] rounded-md overflow-hidden cursor-pointer"
              >
                <span className="block p-3">
                  <FaTwitter />
                </span>
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,rgba(0,0,0,.12),transparent)",
                  }}
                  className="p-3 text-sm font-bold"
                >
                  Twiter
                </div>
              </div>
              <div
                onClick={() => shareViaEmail()}
                className="flex bg-[#ea4335] rounded-md overflow-hidden cursor-pointer"
              >
                <span className="block p-3">
                  <IoMail />
                </span>
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,rgba(0,0,0,.12),transparent)",
                  }}
                  className="p-3 text-sm font-bold"
                >
                  Email
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterPage;
