import React, { useEffect, useState } from "react";
import { useSharedData } from "../components/SharedDataContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import { message } from "antd";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

const Cotizar = () => {
  const sharedData = useSharedData();
  const { proyectoId, modelId } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [unidades, setUnidades] = useState([]);
  const [modelo, setModelo] = useState(null);
  const [propiedad, setPropiedad] = useState(null);
  const [dataCliente, setDataCliente] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    celular: "",
    mensaje: "",
  });
  const [businessData, setBusinessData] = useState([]);

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
      const response = await axios.get(`${apiUrl}/propiedades/${proyectoId}`);
      console.log(response.data);
      setPropiedad(response.data);
      handleCliente(
        "Me gustaría recibir más información de " + response.data.nombre,
        "mensaje"
      );
    } catch (error) {
      console.error("Error fetching propiedades", error);
    }
  };
  const fetchUnidadesByModeloId = async () => {
    try {
      const response = await axios.get(`${apiUrl}/unidadesbymodelo/${modelId}`);
      console.log(response.data);
      setUnidades(response.data);
    } catch (error) {
      console.error("Error fetching unidades del modelo", error);
    }
  };
  const fecthModeloByID = async () => {
    try {
      const response = await axios.get(`${apiUrl}/modelos/${modelId}`);
      console.log(response.data);
      setModelo(response.data);
    } catch (error) {
      console.error("Error fetching modelo", error);
    }
  };
  const handleCliente = (valor, etiqueta) => {
    setDataCliente((prevData) => ({ ...prevData, [etiqueta]: valor }));
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

  useEffect(() => {
    fetchClienteStorage();
    fetchBusinessData();
    fetchPropiedadesById();
    fecthModeloByID();
    fetchUnidadesByModeloId();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [proyectoId, modelId]);
  const handleSendContact = async (e, method) => {
    e.preventDefault();
    if (verificarDataCliente(dataCliente)) {
      const appOrigin = window.location.origin;
      if (method === "whatsapp") {
        const parse_url = `https://api.whatsapp.com/send/?phone=${businessData.phone_contact}&text=Hola+estoy+interesado+en+el+proyecto+${propiedad.nombre}+${appOrigin}/proyectos/${proyectoId}+Mi+consulta+es%3A+${dataCliente.mensaje}&type=phone_number&app_absent=0`;
        try {
          console.log(dataCliente);
          const send = await sendDataCliente({
            ...dataCliente,
            propiedad_id: proyectoId,
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

        let numero = businessData?.phone_contact;
        window.location.href = `tel:${numero}`;
      }
    } else {
      message.warning(
        "Debe llenar todos los campos del formulario para poder contactarlo. Gracias."
      );
    }
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

  return (
    <>
      {propiedad !== null ? (
        <>
          {" "}
          <Helmet>
            <title>
              Cotizar {propiedad.tipo} - Proyecto {propiedad?.nombre} en{" "}
              {propiedad?.exactAddress}, {propiedad?.distrito_name}{" "}
              {propiedad?.provincia_name} {propiedad?.region_name}
            </title>
            <meta name="description" content={propiedad?.descripcion} />
            <meta
              property="og:title"
              content={`${propiedad.purpose} de ${propiedad.tipo} -  Proyecto ${propiedad?.nombre} en ${propiedad?.exactAddress}, ${propiedad?.distrito_name} ${propiedad?.provincia_name} ${propiedad?.region_name}`}
            />
            <meta property="og:description" content={propiedad?.descripcion} />
            <meta
              property="og:image"
              content={`${
                propiedad.logo === "" || propiedad.logo === null
                  ? window.location.origin + "/logo3.png"
                  : propiedad.logo
              }`}
            />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="website" />
            <link rel="canonical" href={window.location.href} />
            <link
              rel="icon"
              href={`${
                propiedad.logo === "" || propiedad.logo === null
                  ? window.location.origin + "/logo3.png"
                  : propiedad.logo
              }`}
            />
            <link
              rel="apple-touch-icon"
              href={`${
                propiedad.logo === "" || propiedad.logo === null
                  ? window.location.origin + "/logo3.png"
                  : propiedad.logo
              }`}
            />
          </Helmet>
          <div>
            <div className="max-w-[1170px] mx-auto px-3 pt-[120px] py-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  <img
                    loading="lazy"
                    className="h-20"
                    src={propiedad.logo}
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
              </div>
              <div
                style={{
                  background: settings.color_primary,
                }}
                className="mb-6 text-white font-bold text-md flex items-center justify-center text-center p-3"
              >
                ¡COTIZA AHORA Y ACCEDE AL PRECIO DE ESTA UNIDAD!
              </div>
              <div className="mb-4">
                <div
                  style={{
                    color: settings.color_primary,
                  }}
                  className="text-center font-bold text-md"
                >
                  Unidades del Modelo FILA 6
                </div>
                <div className="text-center font-normal text-md">
                  (Verifica que tus datos estén correctos para recibir precio,
                  datos de contacto y promociones vigentes)
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="sticky top-[80px] w-full p-4 rounded border border-gray-600 h-max">
                  <h1 className="text-lg font-bold text-bold-font">
                    Selecciona {propiedad.tipo}
                  </h1>
                  <div className="form w-full grid grid-cols-1 gap-2 mb-4">
                    <div className="group">
                      <label
                        className="text-sm font-medium text-bold-font"
                        htmlFor=""
                      >
                        (Ordenamiento por precio de "menor a mayor".)
                      </label>
                      <select
                        value={dataCliente.email}
                        onChange={(e) => handleCliente(e.target.value, "email")}
                        type="email"
                        className="w-full p-3 rounded bg-gray-200 text-sm"
                      >
                        {unidades.length > 0 &&
                          unidades.map((u, index) => {
                            return (
                              <option key={index} value={u.id}>
                                {u.nombre}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                  <h1 className="mb-4 text-lg font-bold text-bold-font">
                    Datos del cliente
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
                        onChange={(e) =>
                          handleCliente(e.target.value, "nombres")
                        }
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
                        onChange={(e) =>
                          handleCliente(e.target.value, "apellidos")
                        }
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
                        onChange={(e) =>
                          handleCliente(e.target.value, "celular")
                        }
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
                        onChange={(e) =>
                          handleCliente(e.target.value, "mensaje")
                        }
                        className="w-full p-3 rounded bg-gray-200 text-sm"
                      />
                    </div>
                    <div className="buttton">
                      {/* <p className="text-sm text-light-font">
                        Enviar mensaje por:
                      </p> */}
                      <button
                        style={{
                          background: settings.color_primary,
                        }}
                        onClick={(e) => handleSendContact(e, "whatsapp")}
                        className="w-full p-3 rounded text-white text-sm flex items-center justify-center gap-3 font-bold"
                      >
                        ¡COTIZA AHORA!
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  {modelo && modelo?.imagenUrl ? (
                    <img className="w-full" src={modelo.imagenUrl} alt="" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default Cotizar;
