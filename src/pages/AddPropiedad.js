import React, { useEffect, useRef, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { GiGps } from "react-icons/gi";
import { MdNumbers } from "react-icons/md";
import MapComponent from "../components/MapComponent";
import axios from "axios";
import { Select, Switch, message } from "antd";
import { FaCalendar, FaTimes } from "react-icons/fa";
import { BsBoundingBoxCircles } from "react-icons/bs";
import Amenities from "../components/Amenities";
import Modelos from "../components/Modelos";
import dayjs from "dayjs";
import { Navigate, useNavigate } from "react-router-dom";

const AddPropiedad = () => {
  const navigate = useNavigate();
  const session = JSON.parse(sessionStorage.getItem("session"));
  const mapRef = useRef();
  const [position, setPosition] = useState([40.416775, -3.70379]); // Coordenadas por defecto (Madrid)
  const [loadingCreate, setLoadingCreate] = useState(false);
  // estados de publicacion
  const [statusPublicacion, setStatusPublicacion] = useState("Borrador");
  // ESTADOS DE DATOS BASICOS
  const [nombrePropiedad, setNombrePropiedad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [fechaCaptacion, setFechaCaptacion] = useState("");
  const [fechaentrega, setFechaentrega] = useState("");
  const [descripcionPropiedad, setDescripcionPropiedad] = useState("");
  const [videoDescripcionPropiedad, setVideoDescripcionPropiedad] =
    useState("");

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
  // ESTADOS PARA INFORMACION DE LA PROPIEDAD Y UBICACION
  const [tipoPropiedad, setTipoPropiedad] = useState("CASA");
  const [proposito, setProposito] = useState("VENTA"); //PARA VENTA O ALQUILER
  const [precioPropiedad, setPrecioPropiedad] = useState(0);
  const [monedaPreciopropiedad, setMonedaPreciopropiedad] = useState("PEN");
  const [postalCode, setPostalCode] = useState("");
  const [exactAddress, setExactAddress] = useState("");
  const [pais, setPais] = useState("Perú");
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  // ESTADOS PARA EL DETALLE DE PROPIEDAD
  const [etapaPropiedad, setEtapaPropiedad] = useState("En construccion");
  const [linkExtra, setLinkExtra] = useState("");
  const [financiamiento, setFinanciamiento] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  // console.log(apiUrl);
  const [areaPropiedad, setAreaPropiedad] = useState(0);
  const [areaContruidaPropiedad, setAreaContruidaPropiedad] = useState(0);
  const [address, setAddress] = useState({
    country: "Perú",
    province: "Lima",
    locality: "Lima",
    zone: "",
    postalCode: "",
    exactAddress: "",
  });
  useEffect(() => {
    const fetchProvinces = async () => {
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
    fetchProvinces();
  }, []);
  const handleProvinceChange = async (e) => {
    console.log(e);

    const provinceId = e === undefined ? "" : e;

    setSelectedProvince(provinceId);
    setSelectedLocality("");
    setSelectedZone("");
    setExactAddress("");
    setPostalCode("");
    setLocalities([]);
    setZones([]);
    if (provinceId === "") {
      return;
    } else {
      try {
        const response = await axios.get(
          `${apiUrl}/provinciasbydepartamento/${provinceId}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );
        setLocalities(response.data);
      } catch (error) {
        console.error("Error al obtener las localidades:", error);
      }
    }
  };
  const handleLocalityChange = async (e) => {
    const localityId = e === undefined ? "" : e;
    setSelectedLocality(localityId);
    setSelectedZone("");
    setExactAddress("");
    setPostalCode("");
    setZones([]);
    if (localityId === "") {
      return;
    } else {
      try {
        const response = await axios.get(
          `${apiUrl}/distritosbyprovincia/${localityId}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );
        setZones(response.data);
      } catch (error) {
        console.error("Error al obtener las zonas:", error);
      }
    }
  };

  const handleZoneChange = (e) => {
    const valor = e === undefined ? "" : e;
    setSelectedZone(valor);
    setExactAddress("");
    setPostalCode("");
  };

  useEffect(() => {
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
        console.log(response);
        console.log(fullAddress);
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const newPos = [parseFloat(lat), parseFloat(lon)];
          setPosition(newPos);
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

    fetchCoordinates();
  }, [address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const handleLocate = () => {
    // Lógica para actualizar la posición basándose en la dirección proporcionada
    // Aquí solo se hace una actualización de ejemplo con coordenadas fijas
    // En una implementación real, deberías usar un servicio de geocodificación
    let provincename = "";
    if (selectedProvince !== "") {
      let provincia = provinces.find((p) => p.id === selectedProvince);
      provincename = provincia.name;
    }
    let lacalityname = "";
    if (selectedLocality !== "") {
      let localidad = localities.find((l) => l.id === selectedLocality);
      lacalityname = localidad.name;
    }
    let zonename = "";
    if (selectedZone !== "") {
      let zona = zones.find((z) => z.id === selectedZone);
      zonename = zona.name;
    }
    let newAdress = {
      country: "Perú",
      province: provincename,
      locality: lacalityname,
      zone: zonename,
      postalCode: postalCode,
      exactAddress: exactAddress,
    };
    setAddress(newAdress); // Coordenadas de ejemplo
  };
  const handleMapClick = async (latlng) => {
    const [lat, lng] = latlng;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    console.log(response.data);
    if (response.data) {
      const { road, town, region, state, postcode } = response.data.address;
      console.log(road, town, region, state, postcode);
      setExactAddress(road);
      setPostalCode(postcode === undefined ? "" : postcode);

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
    setPosition(latlng);
    handleMapClick(latlng);
  };
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImage({ file, url });
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setGalleryImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setDropIndex(null);
  };

  const handleDragEnter = (index) => {
    setDropIndex(index);
  };

  const handleDragLeave = () => {
    setDropIndex(null);
  };

  const handleDrop = () => {
    if (draggedIndex === null || dropIndex === null) return;

    const newImages = [...galleryImages];
    let draggedImage;

    if (draggedIndex === -1) {
      // Si la imagen arrastrada es la imagen de portada
      draggedImage = coverImage;
      if (dropIndex === -1) {
        // Intercambio de portada por portada (no es necesario hacer nada)
        return;
      } else {
        // Intercambio de portada por imagen de la galería
        const droppedImage = newImages[dropIndex];
        newImages[dropIndex] = draggedImage;
        setCoverImage(droppedImage);
      }
    } else {
      // Si la imagen arrastrada es de la galería
      draggedImage = newImages.splice(draggedIndex, 1)[0];
      if (dropIndex === -1) {
        // Intercambio de imagen de la galería por portada
        const currentCoverImage = coverImage;
        setCoverImage(draggedImage);
        if (currentCoverImage) {
          newImages.splice(draggedIndex, 0, currentCoverImage);
        }
      } else {
        // Intercambio de imagen de la galería por imagen de la galería
        newImages.splice(dropIndex, 0, draggedImage);
      }
    }

    setGalleryImages(newImages);
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const sendCoverPropiedad = async (nombrePropiedad) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();
      const propertyName = nombrePropiedad; // Asume que este valor lo obtienes de algún input o estado

      formData.append("propertyName", propertyName);
      if (coverImage) {
        formData.append("coverImage", coverImage.file);
      }

      try {
        const response = await axios.post(`${apiUrl}/uploadimg`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        const data = response.data;
        resolve(data);
        console.log("Upload response:", data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const sendGalleryPropiedad = async (nombrePropiedad) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();
      const propertyName = nombrePropiedad; // Asume que este valor lo obtienes de algún input o estado

      formData.append("propertyName", propertyName);

      galleryImages.forEach((img, index) => {
        formData.append(`galleryImages[${index}]`, img.file);
      });

      try {
        const response = await axios.post(`${apiUrl}/uploadimg`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        const data = response.data;
        resolve(data);
        console.log("Upload response:", data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const sendImagesModelos = async (nombrePropiedad, modelosImages) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();
      const propertyName = nombrePropiedad; // Asume que este valor lo obtienes de algún input o estado

      formData.append("propertyName", propertyName);

      modelosImages.forEach((img, index) => {
        formData.append(`modelosImages[${index}]`, img.file);
      });

      try {
        const response = await axios.post(`${apiUrl}/uploadimg`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        const data = response.data;
        resolve(data);
        console.log("Upload response:", data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const createPropiedad = async (newPropiedad) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/propiedades`,
          newPropiedad,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const createMultimediaPropiedad = async (newMultimedia) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/multimediapropiedades`,
          newMultimedia,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
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
        console.log(response);
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const createModelosPropiedad = async (newModels) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/modelospropiedades`,
          newModels,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const createUnidadesModelos = async (newUnidades) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/unidadesModelos`,
          newUnidades,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  // section amenitites
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [models, setModels] = useState([]);
  const handleSendProperty = async () => {
    setLoadingCreate(false);
    let newPropiedad = {
      nombre: nombrePropiedad,
      tipo: tipoPropiedad,
      purpose: proposito,
      descripcion: descripcionPropiedad,
      video_descripcion: videoDescripcionPropiedad,
      link_extra: linkExtra,
      region: selectedProvince,
      provincia: selectedLocality,
      distrito: selectedZone,
      exactAddress: exactAddress,
      postalcode: postalCode,
      position_locate: position,
      area_from: areaPropiedad,
      area_const_from: areaContruidaPropiedad,
      precio_from: precioPropiedad,
      moneda: monedaPreciopropiedad,
      etapa: etapaPropiedad,
      fecha_entrega: fechaentrega,
      fecha_captacion: fechaCaptacion,
      fecha_created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      financiamiento: financiamiento,
      created_by: session.id,
      status: statusPublicacion,
      name_reference: referencia,
    };
    console.log(newPropiedad);
    console.log(selectedAmenities);
    console.log(coverImage);
    console.log(galleryImages);
    console.log(models);
    const propiedadData = await createPropiedad(newPropiedad);
    console.log(propiedadData);
    if (propiedadData.message === "add") {
      let idPropiedad = propiedadData.id;
      let multimediaPropiedad = [];
      if (coverImage !== null) {
        const coverData = await sendCoverPropiedad(nombrePropiedad);
        let newMultimedia = {
          categoria: "Fotos",
          url_file: coverData.coverImage,
          propiedad_id: idPropiedad,
          etiqueta: "Portada",
        };
        multimediaPropiedad.push(newMultimedia);
      }
      if (galleryImages.length > 0) {
        const galleryData = await sendGalleryPropiedad(nombrePropiedad);
        galleryData.galleryImages.forEach((file) => {
          let newMultimedia = {
            categoria: "Fotos",
            url_file: file,
            propiedad_id: idPropiedad,
            etiqueta: "Galeria",
          };
          multimediaPropiedad.push(newMultimedia);
        });
      }
      if (multimediaPropiedad.length > 0) {
        const multimediaData = await createMultimediaPropiedad(
          multimediaPropiedad
        );
        console.log(multimediaData);
      }
      if (selectedAmenities.length > 0) {
        let newAmenidades = [];
        selectedAmenities.forEach((amenity) => {
          let newAmenidad = {
            propiedad_id: idPropiedad,
            amenidad: amenity,
          };
          newAmenidades.push(newAmenidad);
        });
        const amenidadesData = await createAmenidadesPropiedad(newAmenidades);
        console.log(amenidadesData);
      }
      if (models.length > 0) {
        let newModelos = [];
        let imagesModelos = [];
        models.forEach((model) => {
          let newImage = {
            file: model.imagen,
          };
          imagesModelos.push(newImage);
        });
        const imagesModelosData = await sendImagesModelos(
          nombrePropiedad,
          imagesModelos
        );

        models.forEach((modelo, index) => {
          let newModel = {
            propiedad_id: idPropiedad,
            categoria: modelo.categoria,
            nombre: modelo.nombre,
            imagenUrl:
              imagesModelosData.modelosImages[index] === undefined
                ? ""
                : imagesModelosData.modelosImages[index],
            precio: modelo.precio,
            moneda: modelo.moneda,
            area: modelo.area,
            habs: modelo.habs,
            garage: modelo.garage,
            banios: modelo.banios,
            etapa: modelo.etapa,
          };
          newModelos.push(newModel);
        });
        const modelsData = await createModelosPropiedad(newModelos);
        console.log(modelsData);
        let newUnidades = [];
        modelsData.ids.forEach((idModel, index) => {
          models[index].unidades.forEach((unidad) => {
            let newUnidad = {
              modelo_id: idModel,
              nombre: unidad.nombre,
              status: unidad.status,
            };
            newUnidades.push(newUnidad);
          });
        });
        const unidadesData = await createUnidadesModelos(newUnidades);
        console.log(unidadesData);
      }
      setLoadingCreate(false);
      message.success("Se agrego la propiedad");
      navigate("/propiedades");
    } else {
      message.error("Ocurrio un error");
    }
  };
  return (
    <>
      {loadingCreate ? (
        <div className="fixed top-0 left-0 w-full h-[100vh] bg-gray-600 text-sm flex items-center justify-center">
          Cargando...
        </div>
      ) : null}
      <div className="w-full p-6 app-container-sections">
        <div
          className="mb-[32px] flex items-center justify-between py-4 pr-4"
          style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
        >
          <div className="data">
            <div className="title font-bold text-xl text-bold-font">
              Añadir nueva propiedad
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
                  onChange={() => setStatusPublicacion("Publicado")}
                  checked={statusPublicacion === "Publicado" ? true : false}
                  type="radio"
                  name="estado"
                  className="mr-[6px]"
                  value="Publicado"
                />
                Publicado
              </label>
              <label className="flex items-center text-sm">
                <input
                  onChange={() => setStatusPublicacion("Borrador")}
                  checked={statusPublicacion === "Borrador" ? true : false}
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
            Datos básicos
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="w-full">
              <span className="text-sm font-medium text-bold-font">
                Titulo de la propiedad
              </span>
              <div className="inputPropie">
                <input
                  value={nombrePropiedad}
                  onChange={(e) => setNombrePropiedad(e.target.value)}
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
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
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
                  value={fechaCaptacion}
                  onChange={(e) => setFechaCaptacion(e.target.value)}
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
                  value={descripcionPropiedad}
                  onChange={(e) => setDescripcionPropiedad(e.target.value)}
                  maxLength={255}
                  cols={4}
                  rows={4}
                  type="text"
                  className="bg-[#f8f8f8] text-sm border-0 border-none h-full py-4 px-[12px] w-full focus:outline-none"
                />
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
                  value={videoDescripcionPropiedad}
                  onChange={(e) => setVideoDescripcionPropiedad(e.target.value)}
                  type="text"
                  className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                />
              </div>
              {videoDescripcionPropiedad === "" ? null : (
                <iframe
                  className="w-full max-w-[500px] h-[125px] md:h-[200px]"
                  id="urlvideoY"
                  src={obtenerCodigoVideo(
                    videoDescripcionPropiedad === ""
                      ? ""
                      : videoDescripcionPropiedad
                  )}
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
                  value={tipoPropiedad}
                  onChange={(e) => setTipoPropiedad(e.target.value)}
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
                  value={proposito}
                  onChange={(e) => setProposito(e.target.value)}
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
                  value={precioPropiedad}
                  onChange={(e) => setPrecioPropiedad(e.target.value)}
                  type="number"
                  step={0.01}
                  className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                />
                <select
                  value={monedaPreciopropiedad}
                  onChange={(e) => setMonedaPreciopropiedad(e.target.value)}
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
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
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
                  value={selectedProvince}
                  onChange={handleProvinceChange}
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
                  value={selectedLocality}
                  onChange={handleLocalityChange}
                  disabled={!selectedProvince}
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
                  value={selectedZone}
                  onChange={handleZoneChange}
                  disabled={!selectedLocality}
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
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
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
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                />

                <GiGps className="h-full  min-w-[24px] w-[24px mx-[12px]" />
              </div>
            </div>
          </div>
          <div className="w-full">
            <MapComponent
              position={position}
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
                  value={etapaPropiedad}
                  onChange={(e) => setEtapaPropiedad(e.target.value)}
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
                  value={fechaentrega}
                  onChange={(e) => setFechaentrega(e.target.value)}
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
                  value={financiamiento}
                  onChange={(e) => setFinanciamiento(e)}
                />
              </div>
            </div>
            <div className="w-full ">
              <span className="text-sm font-medium text-bold-font leading-[24px]">
                Link extra (lotizador o render externo)
              </span>
              <div className="inputPropie">
                <input
                  value={linkExtra}
                  onChange={(e) => setLinkExtra(e.target.value)}
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
                  value={areaPropiedad}
                  onChange={(e) => setAreaPropiedad(e.target.value)}
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
                  value={areaContruidaPropiedad}
                  onChange={(e) => setAreaContruidaPropiedad(e.target.value)}
                  type="number"
                  step={0.01}
                  className="bg-[#f8f8f8] text-sm border-0 border-none h-full px-[12px] w-full focus:outline-none"
                />

                <BsBoundingBoxCircles className="h-full  min-w-[24px] w-[24px mx-[12px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="boxPropie mb-6">
          <h1 className="text-md font-medium text-bold-font">Multimedia</h1>

          {/* Cover Image Section */}
          <div className="mt-[24px] mb-[16px]">
            <div className="text-sm text-bold-font font-medium">
              Imagen de portada
            </div>
          </div>
          <div data-position="-1">
            {coverImage && (
              <div
                className={`propie-upload-thumbnail draggable ${
                  dropIndex === -1 ? "dropArea" : ""
                }`}
                style={{ backgroundImage: `url(${coverImage.url})` }}
                draggable="true"
                onDragStart={() => handleDragStart(-1)}
                onDragEnter={() => handleDragEnter(-1)}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="remove" onClick={handleRemoveCoverImage}>
                  <FaTimes />
                </div>
              </div>
            )}
            <div className="inmocms-upload-gallery">
              <button
                className="bg-white text-sm font-medium border-dark-purple border rounded text-dark-purple px-3 py-2"
                onClick={() => document.getElementById("coverInput").click()}
              >
                Subir foto
              </button>
              <input
                id="coverInput"
                className="hidden"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/bmp, image/webp, image/gif, image/x-icon"
                onChange={handleCoverImageChange}
              />
            </div>
            <div className="text-sm text-light-font mt-[16px] mb-[16px]">
              (Tamaño máximo <b>50 Mb</b> por archivo)
            </div>
          </div>

          {/* Gallery Images Section */}
          <div className="mt-[24px] mb-[16px]">
            <div className="text-sm text-bold-font font-medium">
              Galería de imágenes
            </div>
          </div>
          <div className="propie-upload-gallery">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                data-position={index}
                draggable="true"
                className={`propie-upload-thumbnail draggable ${
                  dropIndex === index ? "dropArea" : ""
                }`}
                style={{ backgroundImage: `url(${img.url})` }}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div
                  className="remove"
                  onClick={() => handleRemoveGalleryImage(index)}
                >
                  <FaTimes />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-start">
            <button
              className="bg-white text-sm font-medium border-dark-purple border rounded text-dark-purple px-3 py-2"
              onClick={() => document.getElementById("galleryInput").click()}
            >
              Subir fotos
            </button>
            <input
              id="galleryInput"
              className="hidden"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/bmp, image/webp, image/gif, image/x-icon"
              multiple
              onChange={handleGalleryImagesChange}
            />
          </div>
          <div className="text-sm text-light-font mt-[16px] mb-[16px]">
            (Tamaño máximo <b>50 Mb</b> por archivo)
          </div>
        </div>
        <Amenities
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
        />
        <Modelos models={models} setModels={setModels} />
        <div className="w-full flex justify-between">
          <span className="text-sm text-bold-font font-mdium">
            * Campos requeridos
          </span>
          <button
            disabled={loadingCreate}
            className="btn-create h-[46px] flex gap-2 items-center"
            onClick={() => handleSendProperty()}
          >
            <span className="mobile-hide">Crear propiedad</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AddPropiedad;
