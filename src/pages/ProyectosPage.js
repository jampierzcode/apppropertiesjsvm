import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { message } from "antd";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import ListPropiedadesPage from "../components/ListPropiedadesPage";
import { useSharedData } from "../components/SharedDataContext";

const ProyectosPage = () => {
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
  const mapRef = useRef();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [properties, setProperties] = useState([]);
  const [imagesGallery, setImagesGallery] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { query } = useParams();
  const [propiedad, setPropiedad] = useState([]);
  const buscarPropiedades = async () => {
    try {
      const response = await axios.get(`${apiUrl}/propiedades`);
      setProperties(response.data);
    } catch (error) {
      console.error("Error al obtener las propiedades:", error);
    }
  };
  useEffect(() => {
    buscarPropiedades();
  }, [0]);
  const position =
    propiedad.length !== 0 ? JSON.parse(propiedad.position_locate) : [0, 0];

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo(position, 15); // Cambia a la nueva posición con animación
    }
  }, [position]);
  const [dataCliente, setDataCliente] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    celular: "",
    mensaje: "",
  });
  const [businessData, setBusinessData] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [amenidades, setAmenidades] = useState([]);

  const fetchAmenidades = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/amenidadesbypropiedad/${query}`
      );
      setAmenidades(response.data);
    } catch (error) {
      console.error("Error fetching amenidades data", error);
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/modelosbypropiedad/${query}`);
      setModelos(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching amenidades data", error);
    }
  };

  const fetchClienteStorage = async () => {
    const cliente = JSON.parse(sessionStorage.getItem("cliente"));
    if (cliente) {
      setDataCliente({ ...cliente, mensaje: "" });
    }
  };

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/business`);
      const data = response.data;
      setBusinessData(data.length > 0 ? data[0] : []);
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };

  const fetchPropiedadesById = async () => {
    try {
      const response = await axios.get(`${apiUrl}/propiedades/${query}`);
      console.log(response.data);
      setPropiedad(response.data);
      handleCliente(
        "Me gustaría recibir más información de " + response.data.nombre,
        "mensaje"
      );
    } catch (error) {
      console.error("Error fetching propiedades data", error);
    }
  };

  const fetchGalleryByPropiedadId = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/multimediabypropiedad/${query}`
      );
      setImagesGallery(response.data);
    } catch (error) {
      console.error("Error fetching gallery data", error);
    }
  };

  useEffect(() => {
    fetchAmenidades();
    fetchModelos();
    fetchClienteStorage();
    fetchBusinessData();
    fetchPropiedadesById();
    fetchGalleryByPropiedadId();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [query]);

  const handleCliente = (valor, etiqueta) => {
    setDataCliente((prevData) => ({ ...prevData, [etiqueta]: valor }));
  };

  const verificarDataCliente = (data) => {
    return (
      data.nombres !== "" &&
      data.apellidos !== "" &&
      data.email !== "" &&
      data.mensaje &&
      data.celular !== ""
    );
  };

  const sendDataCliente = async (newData) => {
    try {
      const response = await axios.post(`${apiUrl}/clientes`, newData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return error;
    }
  };
  function obtenerCodigoVideo(url) {
    console.log(url);
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*&v=|.*embed\/|.*be\/|.*watch\?v=))([^"&?\/\s]{11})/
    );
    console.log(match);
    let videosrc = construirURLDeEmbed(match && match[1] ? match[1] : null);

    return videosrc;
  }

  // Función para construir la URL de embed
  function construirURLDeEmbed(codigoVideo) {
    return `https://www.youtube.com/embed/${codigoVideo}`;
  }

  const handleSendContact = async (e, method) => {
    e.preventDefault();
    if (verificarDataCliente(dataCliente)) {
      const appOrigin = window.location.origin;
      if (method === "whatsapp") {
        const parse_url = `https://api.whatsapp.com/send/?phone=${businessData.phone_contact}&text=Hola+estoy+interesado+en+el+proyecto+${propiedad.nombre}+${appOrigin}/proyectos/${query}+Mi+consulta+es%3A+${dataCliente.mensaje}&type=phone_number&app_absent=0`;
        try {
          console.log(dataCliente);
          const send = await sendDataCliente({
            ...dataCliente,
            propiedad_id: query,
            fecha_created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
          console.log(send);
          if (send.message === "add") {
            message.success("Se enviaron los datos correctamente");
            sessionStorage.setItem("cliente", JSON.stringify(dataCliente));
            const link = document.createElement("a");
            link.href = parse_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          } else {
            message.error(
              "Ocurrió algo inesperado, vuelva a intentarlo de nuevo"
            );
          }
        } catch (error) {
          message.error("Ocurrió un error al enviar los datos");
        }
      } else {
        console.log("email");
      }
    } else {
      message.warning(
        "Debe llenar todos los campos del formulario para poder contactarlo. Gracias."
      );
    }
  };
  const createMarkup = (text) => {
    // Verifica si el texto tiene saltos de línea
    if (String(text).includes("\n")) {
      // Si tiene saltos de línea, reemplázalos con <br />
      const formattedText = text.replace(/\n/g, "<br />");
      return { __html: formattedText };
    } else {
      // Si no tiene saltos de línea, retorna el texto tal cual
      return { __html: text };
    }
  };

  return (
    <>
      <div>
        <div className="max-w-[1170px] mx-auto px-3 pt-[95px] py-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap">
              <img
                className="h-20"
                src="https://e.nexoinmobiliario.pe/customers/abril-grupo-inmobiliario-ft/3209-tulipan/logo-tulipan-20231115133638.png"
                alt=""
              />
              <div className="">
                <h1
                  style={{ color: settings.color_primary }}
                  className="font-bold text-lg"
                >
                  {propiedad.nombre}
                </h1>
                <p className="font-medium text-xs text-bold-font">
                  {propiedad.exactAddress}, {propiedad.distrito_name}
                </p>
                <p className="font-medium text-xs text-bold-font">
                  {propiedad.distrito_name}-{propiedad.provincia_name}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="w">
                <h1 className="text-bold-font font-medium text-sm"></h1> Precio
                desde{" "}
                <span
                  style={{ color: settings.color }}
                  className=" text-sm font-bold"
                >
                  {propiedad.moneda === "DOLLAR" ? propiedad.precio_from : null}{" "}
                  {propiedad.moneda === "DOLLAR" ? "$" : "S/"}{" "}
                  {propiedad.moneda === "PEN" ? propiedad.precio_from : null}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="w-full flex flex-col gap-6 md:col-span-8">
              <div className="image-slider-container w-full">
                {imagesGallery.length > 0 ? (
                  <>
                    <div className="h-[250px] md:h-[450px]">
                      <Swiper
                        style={{
                          "--swiper-navigation-color": "#fff",
                          "--swiper-pagination-color": "#fff",
                          width: "100%",
                          height: "100%",
                        }}
                        spaceBetween={10}
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="mySwiper2"
                      >
                        {imagesGallery.map((image, index) => (
                          <SwiperSlide key={index}>
                            <img
                              src={image.url_file}
                              alt={`Imagen ${index + 1}`}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                    <Swiper
                      style={{
                        height: "100px",
                        width: "100%",
                      }}
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      breakpoints={{
                        640: {
                          slidesPerView: 3,
                        },
                        768: {
                          slidesPerView: 4,
                        },
                        1024: {
                          slidesPerView: 4,
                        },
                      }}
                      slidesPerView={2}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="mySwiper my-5"
                    >
                      {imagesGallery.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            style={{ borderColor: settings.color_primary }}
                            className={`border-2`}
                            src={image.url_file}
                            alt={`Thumbnail ${index + 1}`}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  style={{ color: settings.color_primary }}
                  className="underline underline-offset-3 font-bold"
                  to={"/"}
                >
                  Home
                </Link>
                {">"}
                <Link
                  style={{ color: settings.color_primary }}
                  className="underline underline-offset-3 font-bold "
                  to={`/busqueda/${String(
                    propiedad.purpose
                  ).toLowerCase()}-de-${String(propiedad.tipo).toLowerCase()}`}
                >
                  {String(propiedad.purpose).toLowerCase()} de{" "}
                  {String(propiedad.tipo).toLowerCase()}
                </Link>
                {">"}
                <Link
                  style={{ color: settings.color_primary }}
                  className="underline underline-offset-3 font-bold"
                  to={`/busqueda/${String(
                    propiedad.purpose
                  ).toLowerCase()}-de-${String(
                    propiedad.tipo
                  ).toLowerCase()}-en-${propiedad.region_name}-${
                    propiedad.region
                  }`}
                >
                  {propiedad.region_name}
                </Link>
                {">"}
                <Link
                  style={{ color: settings.color_primary }}
                  className="underline underline-offset-3 font-bold "
                  to={`/busqueda/${String(
                    propiedad.purpose
                  ).toLowerCase()}-de-${String(
                    propiedad.tipo
                  ).toLowerCase()}-en-${propiedad.region_name}-${
                    propiedad.provincia_name
                  }-${propiedad.provincia}`}
                >
                  {propiedad.provincia_name}
                </Link>
                {">"}
                <Link
                  style={{ color: settings.color_primary }}
                  className="underline underline-offset-3 font-bold "
                  to={`/busqueda/${String(
                    propiedad.purpose
                  ).toLowerCase()}-de-${String(
                    propiedad.tipo
                  ).toLowerCase()}-en-${propiedad.region_name}-${
                    propiedad.provincia_name
                  }-${propiedad.distrito_name}-${propiedad.distrito}`}
                >
                  {propiedad.distrito_name}
                </Link>
              </div>
              <div className="boxContain">
                <div className="w-full">
                  <h1
                    style={{
                      color: settings.color_primary,
                      borderColor: settings.color_primary,
                    }}
                    className=" font-bold text-lg pb-1 border-b-2  w-full"
                  >
                    Descripcion de la propiedad
                  </h1>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <iframe
                        className="w-full h-[300px]"
                        id="urlvideoY"
                        src={obtenerCodigoVideo(
                          propiedad.length === 0
                            ? ""
                            : propiedad?.video_descripcion
                        )}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <p
                      className="text-sm text-light-font py-4"
                      dangerouslySetInnerHTML={createMarkup(
                        propiedad?.descripcion
                      )}
                    ></p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="boxContain">
                  <div className="w-full">
                    <h1
                      style={{
                        color: settings.color_primary,
                        borderColor: settings.color_primary,
                      }}
                      className=" font-bold text-lg pb-1 border-b-2  w-full"
                    >
                      Información del proyecto
                    </h1>
                    <div
                      style={{ borderColor: settings.color_primary }}
                      className="w-full p-2 border-2 mt-4"
                    >
                      <table>
                        <tbody className="text-xs">
                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Tipo de inmueble</strong>
                            </td>
                            <td className="px-[14px]">{propiedad.tipo}</td>
                          </tr>

                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Área total</strong>
                            </td>
                            <td className="px-[14px]">
                              {propiedad.area_from} m2
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Dormitorios</strong>
                            </td>
                            <td className="px-[14px]">{propiedad.habs}</td>
                          </tr>
                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Etapa del proyecto</strong>
                            </td>
                            <td className="px-[14px]">{propiedad.etapa}</td>
                          </tr>
                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Fecha de entrega</strong>
                            </td>
                            <td className="px-[14px]">
                              {dayjs(propiedad.fecha_entrega).format(
                                "DD [de] MMMM, YYYY"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="px-[14px]"
                              style={{ width: "175px" }}
                            >
                              <strong>Financiamiento</strong>
                            </td>
                            <td className="px-[14px]">
                              {propiedad.financiamiento === 1 ? "SI" : "NO"}
                            </td>
                          </tr>
                          <tr className="Project-inmobiliaria">
                            <td style={{ width: "175PX", textAlign: "center" }}>
                              <figure className="Project-inmobiliaria__logo">
                                <a className="h-12" href="/">
                                  <img
                                    className="h-full"
                                    alt="logo inmobiliario"
                                    src={businessData?.logo}
                                  />
                                </a>
                              </figure>
                            </td>
                            <td className="px-[14px]">
                              <div className="Project-inmobiliaria__name">
                                <h2>{businessData?.nombre_razon}</h2>
                                <div className="bx-link-go">
                                  <Link
                                    className="text-sm font-bold flex gap-2"
                                    to={
                                      "/busqueda/venta-de-departemento-o-casa-o-oficina-o-lote"
                                    }
                                  >
                                    Ver otros proyectos&gt;
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="boxContain">
                  <div className="w-full">
                    <h1
                      style={{
                        color: settings.color_primary,
                        borderColor: settings.color_primary,
                      }}
                      className=" font-bold text-lg pb-1 border-b-2  w-full"
                    >
                      Áreas comunes
                    </h1>
                    <ul className="text-sm text-light-font grid grid-cols-2 gap-2 mt-4">
                      {amenidades.map((amenidad, index) => {
                        return <li key={index}>{amenidad.amenidad}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="boxContain">
                <div className="w-full">
                  <h1
                    style={{
                      color: settings.color_primary,
                      borderColor: settings.color_primary,
                    }}
                    className=" font-bold text-lg pb-1 border-b-2  w-full"
                  >
                    Modelos de {propiedad.tipo}
                  </h1>
                  <div className="w-full">
                    <div className=" max-h-[620px] overflow-y-auto divide-y-2 flex flex-col gap-4">
                      {modelos.length > 0 &&
                        modelos.map((model, index) => {
                          return (
                            <div className="w-full py-4 grid grid-cols-6 gap-3">
                              <div className="w-full">
                                <img
                                  className="w-full"
                                  src={model.imagenUrl}
                                  alt=""
                                />
                              </div>
                              <div className="col-span-4 w-full">
                                <div className="w-full top-info overflow-x-auto flex flex-wrap mb-4">
                                  <span className="px-4 text-sm md:w-[34%]">
                                    Modelo
                                  </span>
                                  <span className="px-4 text-sm md:w-[14%]">
                                    Dorm.
                                  </span>
                                  <span className="px-4 text-sm md:w-[19%]">
                                    Area
                                  </span>
                                  <span className="px-4 text-sm md:w-[28%]">
                                    Precio desde
                                  </span>
                                </div>
                                <div className="w-full bottom-info overflow-x-auto flex flex-wrap">
                                  <span className="px-4 text-sm font-bold md:w-[34%]">
                                    {model.nombre}
                                  </span>
                                  <span className="px-4 text-sm font-bold md:w-[14%]">
                                    {model.habs}
                                  </span>
                                  <span className="px-4 text-sm font-bold md:w-[19%]">
                                    {model.area} m2
                                  </span>
                                  <span className="px-4 text-sm font-bold md:w-[28%]">
                                    {model.moneda === "DOLLAR"
                                      ? model.precio
                                      : null}{" "}
                                    {model.moneda === "DOLLAR" ? "$" : "S/"}{" "}
                                    {model.moneda === "PEN"
                                      ? model.precio
                                      : null}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full">
                                <button
                                  style={{
                                    background: settings.color_primary,
                                  }}
                                  className="rounded font-bold text-white p-2 text-sm"
                                >
                                  Cotizar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="boxContain">
                <div className="w-full">
                  <h1
                    style={{
                      color: settings.color_primary,
                      borderColor: settings.color_primary,
                    }}
                    className=" text-center font-bold text-lg pb-1 border-b-2  w-full"
                  >
                    Plano de ubicación
                  </h1>
                  <div className="w-full mt-4 relative z-10">
                    <MapContainer
                      center={position}
                      zoom={17}
                      className={`h-[200px] md:h-[450px] w-full`}
                      ref={mapRef}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                      <Marker position={position}>
                        <Popup>Propiedades: 1</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky top-[80px] w-full md:col-span-4 p-4 rounded border border-gray-600 h-max">
              <h1 className="mb-4 text-lg font-bold text-bold-font">
                Contáctate con {businessData?.nombre_razon}, por la propiedad{" "}
                {propiedad.nombre}
              </h1>
              <div
                className="form  w-full grid grid-cols-1
              gap-2"
              >
                <div className="group">
                  <label
                    className="text-sm font-medium text-bold-font"
                    htmlFor=""
                  >
                    Correo electronico
                  </label>
                  <input
                    value={dataCliente.email}
                    onChange={(e) => handleCliente(e.target.value, "email")}
                    type="email"
                    className="w-full p-3 rounded bg-gray-200 text-sm"
                  />
                </div>
                <div className="group">
                  <label
                    className="text-sm font-medium text-bold-font"
                    htmlFor=""
                  >
                    Ingresa tus nombres
                  </label>
                  <input
                    value={dataCliente.nombres}
                    onChange={(e) => handleCliente(e.target.value, "nombres")}
                    type="text"
                    className="w-full p-3 rounded bg-gray-200 text-sm"
                  />
                </div>
                <div className="group">
                  <label
                    className="text-sm font-medium text-bold-font"
                    htmlFor=""
                  >
                    Ingresa tus apellidos
                  </label>
                  <input
                    value={dataCliente.apellidos}
                    onChange={(e) => handleCliente(e.target.value, "apellidos")}
                    type="text"
                    className="w-full p-3 rounded bg-gray-200 text-sm"
                  />
                </div>
                <div className="group">
                  <label
                    className="text-sm font-medium text-bold-font"
                    htmlFor=""
                  >
                    Celular
                  </label>
                  <input
                    value={dataCliente.celular}
                    onChange={(e) => handleCliente(e.target.value, "celular")}
                    type="text"
                    className="w-full p-3 rounded bg-gray-200 text-sm"
                  />
                </div>
                <div className="group">
                  <label
                    className="text-sm font-medium text-bold-font"
                    htmlFor=""
                  >
                    Mensaje
                  </label>
                  <textarea
                    value={dataCliente.mensaje}
                    onChange={(e) => handleCliente(e.target.value, "mensaje")}
                    className="w-full p-3 rounded bg-gray-200 text-sm"
                  />
                </div>
                <div className="buttton">
                  <p className="text-sm text-light-font">Enviar mensaje por:</p>
                  <button
                    style={{
                      background: settings.color_primary,
                    }}
                    onClick={(e) => handleSendContact(e, "whatsapp")}
                    className="w-full p-3 rounded-full  text-white text-sm"
                  >
                    Contactar por WhatsApp
                  </button>

                  <button
                    onClick={(e) => handleSendContact(e, "email")}
                    className="w-full p-3 rounded-full bg-gray-200 text-bold-font text-sm mt-4"
                  >
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#f3f4f6] py-[40px] w-full">
          <div className="max-w-[1170px] mx-auto">
            <h1
              style={{
                color: settings.color_primary,
              }}
              className="text-2xl font-bold mb-4"
            >
              Otros proyectos que podrian interesarte
            </h1>
            {properties.length > 0 ? (
              <ListPropiedadesPage
                settings={settings}
                propiedades={properties}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProyectosPage;
