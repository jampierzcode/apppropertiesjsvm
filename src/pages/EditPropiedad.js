import React, { useEffect, useRef, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { GiGps } from "react-icons/gi";
import { MdNumbers } from "react-icons/md";
import MapComponent from "../components/MapComponent";
import axios from "axios";
import { Select, Switch, message } from "antd";
import { FaCalendar } from "react-icons/fa";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { useParams } from "react-router-dom";
import AmenitiesEdit from "../components/AmenitiesEdit";
import LogoUpload from "../components/LogoUpload";

const EditPropiedad = () => {
  //useparams
  const { query } = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  const session = JSON.parse(sessionStorage.getItem("session"));
  const mapRef = useRef(); // Coordenadas por defecto (Madrid)
  const [loadingCreate, setLoadingCreate] = useState(false);
  // ESTADOS DE DATOS BASICOS propiedad
  const [propiedad, setPropiedad] = useState(null);

  const [logoFilePropiedad, setLogoFilePropiedad] = useState("");
  const [initialData, setInitialData] = useState(null);
  // ESTADOS DE DATOS BASICOS propiedad amenidades
  const [amenidades, setAmenidades] = useState([]);
  const [initialAmenidades, setInitialAmenidades] = useState([]);

  useEffect(() => {
    setLoadingCreate(true);
    const fetchPropiedad = async () => {
      try {
        const response = await axios.get(`${apiUrl}/propiedades/${query}`, {});
        console.log(response.data);
        let data = response.data;
        setPropiedad(response.data);
        setInitialData(response.data);
        let newAd = {
          country: "Perú",
          province: data?.region_name,
          locality: data?.provincia_name,
          zone: data?.distrito_name,
          postalCode: data?.postalcode === null ? "" : data?.postalcode,
          exactAddress: data?.exactAddress === null ? "" : data?.exactAddress,
        };
        setAddress(newAd);
        setTimeout(() => {
          setLoadingCreate(false);
        }, 1000);
      } catch (error) {
        console.error("Error al obtener los datos de la propiedad:", error);
      }
    };
    fetchPropiedad();
  }, [apiUrl, query]);
  useEffect(() => {
    if (propiedad) {
      const fetchAmenidadesProperty = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/amenidadesbypropiedad/${query}`,
            {}
          );
          console.log(response.data);
          setAmenidades(response.data);
          setInitialAmenidades(response.data);
        } catch (error) {
          console.error("Error al obtener las amenidades del proyecto:", error);
        }
      };
      fetchAmenidadesProperty();
    }
  }, [apiUrl, query, propiedad]);

  function obtenerCodigoVideo(url) {
    if (url === undefined) {
      return "";
    } else {
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*&v=|.*embed\/|.*be\/|.*watch\?v=))([^"&?\/\s]{11})/
      );
      let videosrc = construirURLDeEmbed(match && match[1] ? match[1] : null);

      return videosrc;
    }
  }

  // Función para construir la URL de embed
  function construirURLDeEmbed(codigoVideo) {
    return `https://www.youtube.com/embed/${codigoVideo}`;
  }
  // ESTADOS PARA INFORMACION DE LA PROPIEDAD Y UBICACION
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [zones, setZones] = useState([]);
  // ESTADOS PARA EL DETALLE DE PROPIEDAD
  const [address, setAddress] = useState({
    country: "Perú",
    province: "Lima",
    locality: "Lima",
    zone: "",
    postalCode: "",
    exactAddress: "",
  });

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/departamentos`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        setProvinces(response.data);
      } catch (error) {
        console.error("Error al obtener los departamentos:", error);
      }
    };
    fetchRegions();
  }, [apiUrl, session.token]);

  useEffect(() => {
    const fetchProvinces = async () => {
      if (propiedad?.region) {
        try {
          const response = await axios.get(
            `${apiUrl}/provinciasbydepartamento/${propiedad.region}`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            }
          );
          setLocalities(response.data);
        } catch (error) {
          console.error("Error al obtener las provincias:", error);
        }
      } else {
        setLocalities([]);
      }
    };
    fetchProvinces();
  }, [propiedad?.region, apiUrl, session.token]);

  useEffect(() => {
    const fetchDistrics = async () => {
      if (propiedad?.provincia) {
        try {
          const response = await axios.get(
            `${apiUrl}/distritosbyprovincia/${propiedad.provincia}`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            }
          );
          setZones(response.data);
        } catch (error) {
          console.error("Error al obtener los distritos:", error);
        }
      } else {
        setZones([]);
      }
    };
    fetchDistrics();
  }, [propiedad?.provincia, apiUrl, session.token]);

  const handlePropiedad = (key, value) => {
    setPropiedad((prev) => {
      const newPropiedad = { ...prev, [key]: value };
      if (key === "region") {
        newPropiedad.provincia = null;
        newPropiedad.distrito = null;
      }
      if (key === "provincia") {
        newPropiedad.distrito = null;
      }
      return newPropiedad;
    });
  };

  const fetchCoordinates = async () => {
    try {
      const { country, province, locality, zone, postalCode, exactAddress } =
        address;
      const fullAddress = `${exactAddress}, ${zone}, ${locality}, ${province}, ${postalCode}, ${country}`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          fullAddress
        )}&format=json&limit=1`
      );
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];

        setPropiedad((prevState) => ({
          ...prevState,
          position_locate: JSON.stringify(newPos),
        }));

        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 17, { duration: 1 }); // Ajustar la vista del mapa a la nueva posición
        }
      } else {
        console.log(
          "No se encontraron coordenadas para la dirección proporcionada."
        );
      }
    } catch (error) {
      console.error("Error al obtener las coordenadas:", error);
    }
  };

  const handleLocate = () => {
    // Lógica para actualizar la posición basándose en la dirección proporcionada
    // Aquí solo se hace una actualización de ejemplo con coordenadas fijas
    // En una implementación real, deberías usar un servicio de geocodificación
    let provincename = "";
    if (propiedad?.region !== "") {
      let provincia = provinces.find((p) => p.id === propiedad?.region);
      provincename = provincia.name;
    }
    let lacalityname = "";
    if (propiedad?.provincia !== "") {
      let localidad = localities.find((l) => l.id === propiedad?.provincia);
      lacalityname = localidad.name;
    }
    let zonename = "";
    if (propiedad?.distrito !== "") {
      let zona = zones.find((z) => z.id === propiedad?.distrito);
      zonename = zona.name;
    }
    let newAdress = {
      country: "Perú",
      province: provincename,
      locality: lacalityname,
      zone: zonename,
      postalCode: propiedad?.postalcode,
      exactAddress: propiedad?.exactAddress,
    };
    setAddress(newAdress); // Coordenadas de ejemplo
    fetchCoordinates();
  };
  const handleMapClick = async (latlng) => {
    const [lat, lng] = latlng;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    if (response.data) {
      const { road, town, region, state, postcode } = response.data.address;

      setPropiedad((prevState) => ({
        ...prevState,
        exactAddress: road,
      }));
      setPropiedad((prevState) => ({
        ...prevState,
        postalCode: postcode === undefined ? "" : postcode,
      }));

      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 17, { duration: 1 }); // Ajustar la vista del mapa a la nueva posición
      }
    } else {
      console.log(
        "No se encontraron coordenadas para la dirección proporcionada."
      );
    }
  };
  const setPositionAndAdress = (latlng) => {
    setPropiedad((prevState) => ({
      ...prevState,
      position_locate: JSON.stringify(latlng),
    }));
    handleMapClick(latlng);
  };

  const createAmenidadesPropiedad = async (newAmenities) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/amenidadespropiedades`,
          newAmenities,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  // section amenitites

  const [addedAmenityIds, setAddedAmenityIds] = useState([]);
  const [removedAmenityIds, setRemovedAmenityIds] = useState([]);
  const compareStates = (state1, state2) => {
    return JSON.stringify(state1) === JSON.stringify(state2);
  };
  const compareStatesAmenidades = (state1, state2) => {
    const ids1 = state1.map((item) => item.id).sort();
    const ids2 = state2.map((item) => item.id).sort();
    return JSON.stringify(ids1) === JSON.stringify(ids2);
  };
  const verificarCambios = () => {
    const arePropiedadesEqual = compareStates(propiedad, initialData);
    const areAmenidadesEqual = compareStatesAmenidades(
      amenidades,
      initialAmenidades
    );

    if (!arePropiedadesEqual || !areAmenidadesEqual) {
      return false;
    } else {
      return true;
    }
  };
  const handleCancel = () => {
    setPropiedad(initialData);
    setAmenidades(initialAmenidades);
  };
  const sendDeleteAmenidades = async (newAmenidades) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/deleteamenidadespropiedades`,
          newAmenidades,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const handleSave = async () => {
    // setLoadingCreate(true);
    const token = session.token;
    const uploadImageUrl = `${apiUrl}/businessimg`;

    const { logo, ...propiedadInfo } = propiedad;

    const uploadLogo = async (changeFile) => {
      console.log(changeFile);
      const formData = new FormData();
      formData.append("imageBusiness", changeFile);
      formData.append("propertyName", "logosproyectos");
      const response = await axios.post(uploadImageUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url;
    };
    const deleteLogo = async (image_url) => {
      console.log(image_url);
      const response = await axios.delete(uploadImageUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          image_url: image_url,
        },
      });
      console.log(response);
      return response.data;
    };

    const updateInfoPropiedad = async (updatePropiedad) => {
      const response = await axios.put(
        `${apiUrl}/propiedades/${query}`,
        updatePropiedad,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    };
    // Existing business data
    if (initialData.logo && !logo) {
      console.log("entro a eliminar");
      // Logo deleted
      const delete_logo = await deleteLogo(initialData.logo);
      if (delete_logo.message === "remove") {
        const response = await updateInfoPropiedad(propiedad);
        console.log(response);
        if (response.message === "update") {
          message.success("Se actualizo correctamente la propiedad");
          setInitialData(propiedad);
          setLogoFilePropiedad("");
        } else {
          message.error("No se actualizo correctamente la propiedad");
        }
      } else {
        message.error("No se elimino la imagen correctamente");
      }
    } else if (logo && logo !== initialData.logo) {
      // Logo changed
      if (initialData.logo !== "" && initialData.logo !== null) {
        const delete_logo = await deleteLogo(initialData.logo);
        console.log(delete_logo)
      }
      const imageUrl = await uploadLogo(logoFilePropiedad);
      const response = await updateInfoPropiedad({
        ...propiedadInfo,
        logo: imageUrl,
      });
      console.log(response);
      if (response.message === "update") {
        message.success("Se actualizo correctamente el modelo");
        setInitialData(propiedad);
        setLogoFilePropiedad("");
        // fetchModelosProperty();
      } else {
        message.error("No se actualizo correctamente el modelo");
      }
    } else {
      // No changes in logo
      const response = await updateInfoPropiedad(propiedad);
      console.log(response);
      if (response.message === "update") {
        message.success("Se actualizo correctamente el modelo");
        setInitialData(propiedad);
        setLogoFilePropiedad("");
        // fetchModelosProperty();
      } else {
        message.error("No se actualizo correctamente el modelo");
      }
    }

    let newAmenidades = [];
    if (addedAmenityIds.length > 0) {
      addedAmenityIds.forEach((amenity) => {
        let newAmenidad = {
          propiedad_id: amenity.propiedad_id,
          amenidad: amenity.amenidad,
        };
        newAmenidades.push(newAmenidad);
      });
      const sendAmenidades = await createAmenidadesPropiedad(newAmenidades);
      if (sendAmenidades.message === "add") {
        // Actualiza el estado create con los nuevos ids
        const updatedCreate = addedAmenityIds.map((item, index) => ({
          ...item,
          id: sendAmenidades.ids[index], // Asumiendo que los ids están en el mismo orden
        }));
        newAmenidades = updatedCreate;
      } else {
        message.error("Ocurrio un error, intentelo mas tarde");
        setTimeout(() => {
          setLoadingCreate(false);
        }, 1000);
        return;
      }
    }
    if (removedAmenityIds.length > 0) {
      const deleteAmenidades = await sendDeleteAmenidades(removedAmenityIds);
      if (deleteAmenidades.message === "delete") {
      } else {
        message.error("Ocurrio un error, intentelo mas tarde");
        setTimeout(() => {
          setLoadingCreate(false);
        }, 1000);
        return;
      }
    }
    let updatedAmenidades = [...initialAmenidades];

    // Agregar las nuevas amenidades solo si el array no está vacío
    if (newAmenidades.length > 0) {
      updatedAmenidades = [...updatedAmenidades, ...newAmenidades];
    }

    // Filtrar las amenidades eliminadas solo si el array no está vacío
    if (removedAmenityIds.length > 0) {
      updatedAmenidades = updatedAmenidades.filter(
        (amenidad) =>
          !removedAmenityIds.some((eliminada) => eliminada.id === amenidad.id)
      );
    }
    setAddedAmenityIds([]);
    setRemovedAmenityIds([]);
    setInitialAmenidades(updatedAmenidades);
    setAmenidades(updatedAmenidades);
    message.success("Se actualizo correctamente la propiedad");
    // setTimeout(() => {
    //   setLoadingCreate(false);
    // }, 1000);
  };
  return (
    <>
      {loadingCreate ? (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-[100vh] bg-dark-purple text-white text-xl flex items-center justify-center z-[2000] ">
          Cargando...
        </div>
      ) : null}
      {propiedad ? (
        <div className="w-full p-6 app-container-sections">
          <div
            className="mb-[32px] flex items-center justify-between py-4 pr-4"
            style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
          >
            <div className="data">
              <div className="title font-bold text-xl text-bold-font">
                Editar propiedad
              </div>
              <div className="subtitle max-w-[30vw] text-sm font-normal text-light-font">
                Introduce todos los datos sobre la propeidad.Los campos marcados
                con un asterisco( * ) son obligatorios.
              </div>
            </div>
            <div className="options bg-gray-50 p-4"></div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-lg bg-white shadow flex items-center p-4 flex-grow-0 mb-[24px]">
              <div className="box-top">
                <div className="font-medium text-bold-font"> Estado </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap ml-[8px]">
                <label className="flex items-center text-sm">
                  <input
                    onChange={() => handlePropiedad("status", "Publicado")}
                    checked={propiedad?.status === "Publicado" ? true : false}
                    type="radio"
                    name="estado"
                    className="mr-[6px]"
                    value="Publicado"
                  />
                  Publicado
                </label>
                <label className="flex items-center text-sm">
                  <input
                    onChange={() => handlePropiedad("status", "Borrador")}
                    checked={propiedad?.status === "Borrador" ? true : false}
                    type="radio"
                    name="estado"
                    className="mr-[6px]"
                    value="Borrador"
                    // checked={true}
                  />
                  Borrador
                </label>
              </div>
            </div>
          </div>
          <div className="boxPropie mb-6">
            <h1 className="text-lg font-medium text-bold-font mb-[16px]">
              Logo
            </h1>
            <div className="w-full flex items-center gap-3">
              <LogoUpload
                setLogoFile={setLogoFilePropiedad}
                logo={propiedad.logo}
                setLogo={(logo) =>
                  setPropiedad((prevState) => ({
                    ...prevState,
                    logo,
                  }))
                }
              />
            </div>
            <h1 className="text-lg font-medium text-bold-font mb-[16px]">
              Datos básicos
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font">
                  Titulo de la propiedad
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.nombre}
                    onChange={(e) => handlePropiedad("nombre", e.target.value)}
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                  <BiEdit className="h-full  min-w-[24px] opacity-5 w-[24px mx-[12px]" />
                </div>
              </div>
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font">
                  Referencia *
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.referencia}
                    onChange={(e) =>
                      handlePropiedad("referencia", e.target.value)
                    }
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                  <BiEdit className="h-full  min-w-[24px] opacity-5 w-[24px mx-[12px]" />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font">
                  Fecha Captacion
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.fecha_captacion}
                    onChange={(e) =>
                      handlePropiedad("fecha_captacion", e.target.value)
                    }
                    type="date"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font">
                  Descripcion de la propiedad
                </span>
                <div className="bg-[#f8f8f8] border border-[#c7c6c6] text-[#000] rounded-lg">
                  <textarea
                    value={propiedad.descripcion}
                    onChange={(e) =>
                      handlePropiedad("descripcion", e.target.value)
                    }
                    maxLength={2000}
                    cols={4}
                    rows={4}
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full py-4 px-[12px] w-full focus:outline-none"
                  />
                  <span className="text-xs text-light-font">
                    Maximo 2000 caracteres
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font">
                  Video Url Descripcion Youtube
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.video_descripcion}
                    onChange={(e) =>
                      handlePropiedad("video_descripcion", e.target.value)
                    }
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                </div>
                {propiedad.video_descripcion === "" ? null : (
                  <iframe
                    className="w-full max-w-[500px] h-[125px] md:h-[200px]"
                    id="urlvideoY"
                    src={obtenerCodigoVideo(propiedad.video_descripcion)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
          <div className="boxPropie mb-6">
            <h1 className="text-md font-medium text-bold-font">
              Información sobre la propiedad
            </h1>
            <p className="text-light-font text-sm mb-[16px]">
              Datos necesarios para su publicación en los portales inmobiliarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Tipo de inmueble
                </span>
                <div className="inputPropie">
                  <select
                    value={propiedad.tipo}
                    onChange={(e) => handlePropiedad("tipo", e.target.value)}
                    name=""
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  >
                    <option value="0" disabled hidden>
                      Selecione una la tipologia de la proiedad
                    </option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Lote">Lote</option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Venta/Alquiler
                </span>
                <div className="inputPropie">
                  <select
                    value={propiedad.purpose}
                    onChange={(e) => handlePropiedad("purpose", e.target.value)}
                    name=""
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  >
                    <option value="0" disabled hidden>
                      Selecione una la tipologia de la proiedad
                    </option>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Precio
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.precio_from}
                    onChange={(e) =>
                      handlePropiedad("precio_from", e.target.value)
                    }
                    type="number"
                    step={0.01}
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                  <select
                    value={propiedad.moneda}
                    onChange={(e) => handlePropiedad("moneda", e.target.value)}
                    name=""
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-[60px] focus:outline-none"
                  >
                    <option value="0" disabled hidden>
                      Selecione la moneda
                    </option>
                    <option value="PEN">S/</option>
                    <option value="DOLLAR">$</option>
                  </select>

                  {/* <BiDollar className="h-full  min-w-[24px] w-[24px mx-[12px]" /> */}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  País
                </span>
                <div className="inputPropie">
                  <select
                    name=""
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  >
                    <option value="0" disabled hidden>
                      Selecione el pais
                    </option>
                    <option value="Perú">Perú</option>
                  </select>
                </div>
              </div>
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Region(departamento)
                </span>
                <div className="inputPropie">
                  <Select
                    allowClear
                    style={{ fontSize: "14px" }}
                    showSearch
                    className="bg-[#f8f8f8] text-sm border-0 h-full px-[12px] w-full focus:outline-none"
                    placeholder="Seleccione una provincia"
                    variant="borderless"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={
                      provinces.length > 0 &&
                      provinces.map((province) => ({
                        value: province.id,
                        label: province.name,
                      }))
                    }
                    value={propiedad.region}
                    onChange={(e) => handlePropiedad("region", e)}
                  />
                </div>
              </div>
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Localidad(provincia)
                </span>
                <div className="inputPropie">
                  <Select
                    allowClear
                    style={{ fontSize: "14px" }}
                    showSearch
                    className="bg-[#f8f8f8] text-sm border-0 h-full px-[12px] w-full focus:outline-none"
                    placeholder="Search to Select"
                    variant="borderless"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={localities.map((locality) => ({
                      value: locality.id,
                      label: locality.name,
                    }))}
                    value={propiedad.provincia}
                    onChange={(e) => handlePropiedad("provincia", e)}
                    disabled={!propiedad.region}
                  />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Zona(Distrito)
                </span>
                <div className="inputPropie">
                  <Select
                    allowClear
                    style={{ fontSize: "20px" }}
                    showSearch
                    className="bg-[#f8f8f8] text-sm border-0 h-full px-[12px] w-full focus:outline-none"
                    placeholder="Search to Select"
                    variant="borderless"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={zones.map((zone) => ({
                      value: zone.id,
                      label: zone.name,
                    }))}
                    value={propiedad.distrito}
                    onChange={(e) => handlePropiedad("distrito", e)}
                    disabled={!propiedad.provincia}
                  />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Código postal
                </span>
                <div className="inputPropie">
                  <input
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                    value={propiedad.postalcode}
                    onChange={(e) =>
                      handlePropiedad("postalcode", e.target.value)
                    }
                  />

                  <MdNumbers className="h-full  min-w-[24px] w-[24px mx-[12px]" />
                </div>
              </div>
              <div className="w-full ">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-bold-font leading-[24px]">
                    Direccion exacta
                  </span>
                  <button
                    onClick={handleLocate}
                    className="px-2 text-sm rounded bg-[#4b25f9] text-white"
                  >
                    Localizar
                  </button>
                </div>
                <div className="inputPropie">
                  <input
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                    value={
                      propiedad.exactAddress === null
                        ? ""
                        : propiedad.exactAddress
                    }
                    onChange={(e) =>
                      handlePropiedad("exactAddress", e.target.value)
                    }
                  />

                  <GiGps className="h-full  min-w-[24px] w-[24px mx-[12px]" />
                </div>
              </div>
            </div>
            <div className="w-full relative z-10">
              <MapComponent
                position={JSON.parse(propiedad?.position_locate)}
                address={address}
                mapRef={mapRef}
                setPosition={setPositionAndAdress}
              />
            </div>
          </div>
          <div className="boxPropie mb-6">
            <h1 className="text-md font-medium text-bold-font">
              Detalles de la propiedad
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Etapa de Desarrollo
                </span>
                <div className="inputPropie">
                  <select
                    value={propiedad.etapa}
                    onChange={(e) => handlePropiedad("etapa", e.target.value)}
                    name=""
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  >
                    <option value="0" disabled hidden>
                      Selecione un estado de desarrollo
                    </option>
                    <option value="En construccion">En construccion</option>
                    <option value="En planos">En planos</option>
                    <option value="Entregado">Entregado</option>
                    <option value="En titulacion">En titulacion</option>
                    <option value="En registros publicos">
                      En registros publicos
                    </option>
                    <option value="Vendido">Vendido</option>
                    <option value="Separado">Separado</option>
                    <option value="Alquilado">Alquilado</option>
                  </select>
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Fecha Entrega
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.fecha_entrega}
                    onChange={(e) =>
                      handlePropiedad("fecha_entrega", e.target.value)
                    }
                    type="date"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                  <FaCalendar className="h-full  min-w-[24px] w-[24px mx-[12px]" />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Financiamiento
                </span>
                <div className="w-full mt-2">
                  <Switch
                    value={propiedad.financiamiento === "1" ? true : false}
                    onChange={(e) =>
                      handlePropiedad("financiamiento", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Link extra (lotizador o render externo)
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.link_extra}
                    onChange={(e) =>
                      handlePropiedad("link_extra", e.target.value)
                    }
                    type="text"
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Superficie util m2 (*)
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.area_from}
                    onChange={(e) =>
                      handlePropiedad("area_from", e.target.value)
                    }
                    type="number"
                    step={0.01}
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />
                  <BsBoundingBoxCircles className="h-full  min-w-[24px] w-[24px mx-[12px]" />
                </div>
              </div>
              <div className="w-full ">
                <span className="text-sm font-medium text-bold-font leading-[24px]">
                  Superficie contruida m2 (*)
                </span>
                <div className="inputPropie">
                  <input
                    value={propiedad.area_const_from}
                    onChange={(e) =>
                      handlePropiedad("area_const_from", e.target.value)
                    }
                    type="number"
                    step={0.01}
                    className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                  />

                  <BsBoundingBoxCircles className="h-full  min-w-[24px] w-[24px mx-[12px]" />
                </div>
              </div>
            </div>
          </div>
          <AmenitiesEdit
            propiedad_id={query}
            setAddedAmenityIds={setAddedAmenityIds}
            setRemovedAmenityIds={setRemovedAmenityIds}
            selectedAmenities={amenidades}
            setSelectedAmenities={setAmenidades}
            initialAmenities={initialAmenidades}
          />
          <div className="w-full flex justify-between px-3 bottom-[-31px] py-6 sticky z-50 bg-white shadow-md">
            <span className="text-sm text-bold-font font-mdium">
              * Campos requeridos
            </span>
            <div className="flex items-center gap-4 justify-end">
              <button
                disabled={verificarCambios()}
                onClick={handleCancel}
                className={`rounded-full text-[12px] px-5 py-2   ${
                  verificarCambios()
                    ? "text-gray-500 bg-gray-300"
                    : "text-bold-font bg-white border-gray-300 border"
                }`}
              >
                Cancelar
              </button>
              <button
                disabled={verificarCambios()}
                onClick={handleSave}
                className={`rounded-full text-[12px] px-5 py-2 ${
                  verificarCambios()
                    ? "text-gray-500 bg-gray-300"
                    : "text-white bg-dark-purple"
                } `}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default EditPropiedad;
