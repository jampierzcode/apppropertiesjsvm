import { Button, Dropdown, message, Modal, Select, Space, Switch } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import { FaStrava } from "react-icons/fa6";
import { MdAdd } from "react-icons/md";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { useParams } from "react-router-dom";
import LogoUpload from "../components/LogoUpload";
import { BsViewList } from "react-icons/bs";

const PropertyModelos = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const session = JSON.parse(sessionStorage.getItem("session"));
  const { propertyId } = useParams();
  const [modelos, setModelos] = useState([]);
  const [filterModelos, setFilterModelos] = useState([]);
  const fetchModelosProperty = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/modelosbypropiedad/${propertyId}`,
        {}
      );
      console.log(response.data);
      setModelos(response.data);
      setFilterModelos(response.data);
    } catch (error) {
      console.error("Error al obtener las amenidades del proyecto:", error);
    }
  };
  useEffect(() => {
    fetchModelosProperty();
  }, [propertyId]);
  // ESTADOS PARA LA TABLA DINAMICA
  const [selectsModelos, setSelectsModelos] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleModelos, setVisibleModelos] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    nombre: "",
    categoria: "",
    precioRange: [0, Infinity],
    area: 0,
    imagenUrl: "",
    habs: 0,
    garage: false,
    banios: 0,
    moneda: "",
    etapa: "",
  });

  // Función para aplicar el filtro
  const detectarTotalPages = (data) => {
    if (data.length === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  };
  const applyFilters = () => {
    const filteredModelos = filterModelos.filter((modelo) => {
      const searchRegex = new RegExp(searchTerm, "i");

      const matchSearch = Object.values(modelo).some((value) =>
        searchRegex.test(value.toString())
      );

      const matchFilters =
        (!filters.nombre || modelo.nombre === filters.nombre) &&
        Number(modelo.precio) >= filters.precioRange[0] &&
        Number(modelo.precio) <= filters.precioRange[1];

      return matchSearch && matchFilters;
    });
    console.log(filteredModelos);
    detectarTotalPages(filteredModelos);
    const startIndex = (currentPage - 1) * itemsPerPage;
    // setCurrentPage(1);
    const paginatedProperties = filteredModelos.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleModelos(paginatedProperties);
  };

  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterModelos, currentPage, itemsPerPage, searchTerm]);

  const handleSelect = (id) => {
    setSelectsModelos((prevSelects) => {
      if (prevSelects.includes(id)) {
        return prevSelects.filter((p) => p !== id);
      } else {
        return [...prevSelects, id];
      }
    });
  };
  const handleCheckSelect = (e, id) => {
    e.stopPropagation();
    let active = e.target.checked;
    if (active) {
      setSelectsModelos((prevSelects) => [...prevSelects, id]);
    } else {
      setSelectsModelos((prevSelects) => prevSelects.filter((p) => p !== id));
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const visiblePropertyIds = visibleModelos.map((modelo) => modelo.id);

    if (isChecked) {
      setSelectsModelos((prevSelects) => [
        ...new Set([...prevSelects, ...visiblePropertyIds]),
      ]);
    } else {
      setSelectsModelos((prevSelects) =>
        prevSelects.filter((id) => !visiblePropertyIds.includes(id))
      );
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFiltersChange = (changedFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...changedFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: "",
      precioRange: [0, Infinity],
      pais: "",
      region: "",
      provincia: "",
      distrito: "",
      fechaCreatedRange: [null, null],
      fechaEntregaRange: [null, null],
    });

    setSearchTerm("");
    setCurrentPage(1);
    detectarTotalPages(filterModelos);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filterModelos.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleModelos(paginatedProperties);
  };
  const handleEliminarModelo = (e, id) => {
    e.stopPropagation();
    console.log(id);
  };
  const handleViewUnidades = (e, id) => {
    e.stopPropagation();
    console.log(id);
  };
  const eliminarSeleccion = () => {
    console.log(selectsModelos);
  };
  const items = [
    {
      key: "1",
      label: (
        <p
          onClick={() => eliminarSeleccion()}
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          <FaTrash /> Eliminar
        </p>
      ),
    },
  ];
  const categorias = [
    "Sin categoría",
    "Flat",
    "Duplex",
    "Triplex",
    "Penthouse",
  ];
  // estados para editar modelos
  const [logoFile, setLogoFile] = useState("");
  const [activeModelo, setActiveModelo] = useState(null);
  const [initialModeloAtivo, setinitialModeloAtivo] = useState(null);
  const [isModalOpenModelo, setIsModalOpenModelo] = useState(false);

  // estados para crear nuevo modelo
  const [logoFileCreate, setLogoFileCreate] = useState("");
  const [modelCreate, setModelCreate] = useState({
    propiedad_id: propertyId,
    nombre: "",
    categoria: "",
    habs: 0,
    precio: 0,
    area: 0,
    imagenUrl: "",
    garage: false,
    banios: 0,
    moneda: "PEN",
    etapa: "En planos",
  });
  const sendImagesModelos = async (modelosImages) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();

      formData.append("propertyName", "modelos");

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
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const handleOkCreate = async () => {
    console.log("save");
    console.log(modelCreate);
    let urlImagen = "";
    if (modelCreate.imagenUrl !== "") {
      const sendImagen = await sendImagesModelos([{ file: logoFileCreate }]);
      console.log(sendImagen);
      urlImagen = sendImagen.modelosImages[0];
    }
    const newModel = { ...modelCreate };
    newModel.imagenUrl = urlImagen;
    const modelsData = await createModelosPropiedad([newModel]);
    console.log(modelsData);
    if (modelsData.message === "add") {
      if (unidades.length > 0) {
        let newUnidades = [...unidades];
        newUnidades.forEach((unidad) => {
          unidad.modelo_id = modelsData.ids[0];
        });

        const unidadesData = await createUnidadesModelos(newUnidades);
        console.log(unidadesData);
        message.success("Se registro el modelo y sus unidades correctamente");
      } else {
        message.success("Se registro el modelo correctamente");
      }
      setLogoFile("");
      setModelCreate({
        propiedad_id: propertyId,
        nombre: "",
        categoria: "",
        habs: 0,
        precio: 0,
        area: 0,
        imagenUrl: "",
        garage: false,
        banios: 0,
        moneda: "PEN",
        etapa: "En planos",
      });
      setIsModalOpenCreate(false);
      await fetchModelosProperty();
    } else {
      message.error("Ocurrio un error al crear el modelo, intentelo mas tarde");
    }
  };
  const handleCancelCreate = () => {
    setLogoFile("");
    setModelCreate({
      propiedad_id: propertyId,
      nombre: "",
      categoria: "",
      habs: 0,
      precio: 0,
      area: 0,
      imagenUrl: "",
      garage: false,
      banios: 0,
      moneda: "PEN",
      etapa: "En planos",
    });
    setIsModalOpenCreate(false);
  };
  // funciones para crear nuevo modelo

  const abrirModalCreate = (e) => {
    e.stopPropagation();
    setIsModalOpenCreate(true);
  };
  const handleModelChangeCreate = (key, value) => {
    setModelCreate((prev) => {
      const newModelo = { ...prev, [key]: value };

      return newModelo;
    });
  };

  // funciones para editar modelo
  const compareStates = (state1, state2) => {
    return JSON.stringify(state1) === JSON.stringify(state2);
  };
  const verificarCambios = () => {
    const areModeloActivoEqual = compareStates(
      activeModelo,
      initialModeloAtivo
    );

    if (!areModeloActivoEqual) {
      return false;
    } else {
      return true;
    }
  };
  const handleCancelModelo = () => {
    console.log("restaurar");
    setIsModalOpenModelo(false);
    setActiveModelo(null);
    setinitialModeloAtivo(null);
  };
  const abrirModalEdit = (e, modeloId) => {
    e.stopPropagation();
    const searchModelo = modelos.find((m) => m.id === modeloId);
    setActiveModelo(searchModelo);
    setinitialModeloAtivo(searchModelo);
    setIsModalOpenModelo(true);
  };
  const handleSave = async () => {
    const token = session.token;
    const uploadImageUrl = `${apiUrl}/businessimg`;

    const { imagenUrl, ...modeloInfo } = activeModelo;

    const uploadLogo = async (changeFile) => {
      const formData = new FormData();
      formData.append("imageBusiness", changeFile);
      formData.append("propertyName", "modelos");
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

    const updateInfoModelo = async (updateModelo) => {
      const response = await axios.put(
        `${apiUrl}/updatemodelo/${activeModelo.id}`,
        updateModelo,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    };

    try {
      // Existing business data
      if (initialModeloAtivo.imagenUrl && !imagenUrl) {
        // Logo deleted
        const delete_logo = await deleteLogo(initialModeloAtivo.imagenUrl);
        if (delete_logo.message === "remove") {
          const response = await updateInfoModelo(activeModelo);
          console.log(response);
          if (response.message === "update") {
            message.success("Se actualizo correctamente tus datos");
            setinitialModeloAtivo(activeModelo);
            fetchModelosProperty();
          } else {
            message.error("No se actualizo correctamente tus datos");
          }
        } else {
          message.error("No se elimino la imagen correctamente");
        }
      } else if (imagenUrl && imagenUrl !== initialModeloAtivo.imagenUrl) {
        // Logo changed
        if (initialModeloAtivo.imagenUrl !== "") {
          const delete_logo = await deleteLogo(initialModeloAtivo.imagenUrl);
          console.log(delete_logo)
        }
        const imageUrl = await uploadLogo(logoFile);
        const response = await updateInfoModelo({
          ...modeloInfo,
          imagenUrl: imageUrl,
        });
        console.log(response);
        if (response.message === "update") {
          message.success("Se actualizo correctamente el modelo");
          setinitialModeloAtivo(activeModelo);
          fetchModelosProperty();
        } else {
          message.error("No se actualizo correctamente el modelo");
        }
      } else {
        // No changes in logo
        const response = await updateInfoModelo(activeModelo);
        console.log(response);
        if (response.message === "update") {
          message.success("Se actualizo correctamente el modelo");
          setinitialModeloAtivo(activeModelo);
          fetchModelosProperty();
        } else {
          message.error("No se actualizo correctamente el modelo");
        }
      }
    } catch (error) {
      console.error("Error saving business data", error);
      message.error("Failed to save business information");
    }
  };

  const handleModelChange = (key, value) => {
    setActiveModelo((prev) => {
      const newModelo = { ...prev, [key]: value };

      return newModelo;
    });
  };
  const [prefijo, setPrefijo] = useState("");
  const [numberUnidades, setNumberUnidades] = useState(0);
  const [unidades, setUnidades] = useState([]);
  const handleCreateUnidades = () => {
    const numero = numberUnidades;
    console.log(numero);
    let newsUnidades = [];
    if (numero === 0) {
      message.warning("El numero de unidades debe ser mayor a 0");
    } else {
      for (let index = 0; index < numero; index++) {
        let newUnidad = {
          modelo_id: "",
          nombre: `${prefijo}${index + 1}`,
          status: "Disponible",
        };
        newsUnidades.push(newUnidad);
      }
      setUnidades(newsUnidades);
    }
  };
  const handleResetUnidades = () => {
    setUnidades([]);
    setNumberUnidades(0);
    setPrefijo("");
  };
  const handleUnitChange = (unitIndex, value) => {
    const updateUnidades = unidades.map((unidad, i) =>
      i === unitIndex ? { ...unidad, nombre: value } : unidad
    );
    setUnidades(updateUnidades);
  };

  return (
    <div className="w-full p-6 app-container-sections">
      <div
        className="mb-[32px] flex items-center justify-between py-4 pr-4"
        style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
      >
        <div className="data">
          <div className="title font-bold text-xl text-bold-font">
            Modelos de {modelos[0]?.nombre_propiedad}
          </div>
          <div className="subtitle max-w-[30vw] text-xs font-normal text-light-font">
            Modelos de la propiedad con identificador: {propertyId}
          </div>
        </div>
        <div className="options bg-gray-50 p-4">
          <div className="page-top-card flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <FaStrava />
            </div>
            <div>
              <div className="value font-bold text-bold-font text-xl">
                {modelos.length}
              </div>
              <div className="text-sm font-normal text-light-font">
                Total Modelos
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="horizontal-options flex items-center mb-[24px]">
        <div className="search-hook flex-grow">
          <div className="inmocms-input bg-white border rounded border-gray-300 flex text-sm h-[46px] overflow-hidden font-normal">
            <input
              className="h-full px-[12px] w-full border-0 border-none focus:outline-none"
              placeholder="Buscar modelo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="on"
            />
            <AiOutlineSearch className="h-full w-[24px] min-w-[24px] opacity-5 mx-[12px]" />
          </div>
        </div>
        <div className="horizontal-options-items ml-[28px] flex items-center">
          <button
            onClick={() => setActiveFilter(!activeFilter)}
            className="inmocms-button bg-dark-blue text-white rounded p-4"
          >
            <TbAdjustments />
          </button>
          <button
            onClick={(e) => abrirModalCreate(e)}
            className="btn-new ml-[12px] h-[46px] flex gap-2 items-center"
          >
            <MdAdd className="text-white" />
            <span className="mobile-hide">Añadir modelo</span>
          </button>
        </div>
      </div>
      <Modal
        footer={null}
        title="Editar modelo"
        open={isModalOpenModelo}
        onCancel={handleCancelModelo}
      >
        {activeModelo !== null ? (
          <div className="model grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 relative">
            <div className="md:col-span-1">
              <label className="text-sm w-full block font-medium  mb-4 ">
                Subir Imagen
              </label>
              <div className="w-full flex items-center gap-3">
                <LogoUpload
                  setLogoFile={setLogoFile}
                  logo={activeModelo.imagenUrl}
                  setLogo={(imagenUrl) =>
                    setActiveModelo((prevState) => ({
                      ...prevState,
                      imagenUrl,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Categoría
              </label>
              <select
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                value={activeModelo.categoria}
                onChange={(e) => handleModelChange("categoria", e.target.value)}
              >
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Nombre
              </label>
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={activeModelo.nombre}
                onChange={(e) => handleModelChange("nombre", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4 ">
                Etapa
              </label>
              <select
                name=""
                id="estado_modelo"
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                value={activeModelo.etapa}
                onChange={(e) => handleModelChange("etapa", e.target.value)}
              >
                <option value="En planos">En planos</option>
                <option value="Construccion">Construccion</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm w-full block font-medium mb-4 ">
                Precio Desde
              </label>
              <div className="w-full flex">
                <select
                  value={activeModelo.moneda}
                  onChange={(e) => handleModelChange("moneda", e.target.value)}
                  name=""
                  className="bg-gray-200 rounded px-3 py-2 text-sm"
                  id="moneda"
                >
                  <option value="PEN">S/</option>
                  <option value="DOLLAR">$</option>
                </select>
                <input
                  className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                  type="number"
                  value={activeModelo.precio}
                  onChange={(e) => handleModelChange("precio", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4">
                Área Desde
              </label>
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={activeModelo.area}
                onChange={(e) => handleModelChange("area", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4">
                N° Habitaciones
              </label>
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={activeModelo.habs}
                onChange={(e) => handleModelChange("habs", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4">
                Garage
              </label>
              <Switch
                value={Number(activeModelo.garage) === 1 ? true : false}
                onChange={(e) => handleModelChange("garage", e)}
              />
            </div>
            <div>
              <label className="text-sm w-full block font-medium mb-4">
                Baños
              </label>
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="text"
                value={activeModelo.banios}
                onChange={(e) => handleModelChange("banios", e.target.value)}
              />
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-4 justify-end">
          <button
            disabled={verificarCambios()}
            onClick={handleCancelModelo}
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
      </Modal>
      <Modal
        footer={null}
        title="Crear modelo"
        open={isModalOpenCreate}
        onOk={handleOkCreate}
        onCancel={handleCancelCreate}
      >
        <div className="model grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 relative">
          <div className="md:col-span-1">
            <label className="text-sm w-full block font-medium  mb-4 ">
              Subir Imagen
            </label>
            <div className="w-full flex items-center gap-3">
              <LogoUpload
                setLogoFile={setLogoFileCreate}
                logo={modelCreate?.imagenUrl}
                setLogo={(imagenUrl) =>
                  setModelCreate((prevState) => ({
                    ...prevState,
                    imagenUrl,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4 ">
              Categoría
            </label>
            <select
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              value={modelCreate?.categoria}
              onChange={(e) =>
                handleModelChangeCreate("categoria", e.target.value)
              }
            >
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4 ">
              Nombre
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="text"
              value={modelCreate?.nombre}
              onChange={(e) =>
                handleModelChangeCreate("nombre", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4 ">
              Etapa
            </label>
            <select
              name=""
              id="estado_modelo"
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              value={modelCreate?.etapa}
              onChange={(e) => handleModelChangeCreate("etapa", e.target.value)}
            >
              <option value="En planos">En planos</option>
              <option value="Construccion">Construccion</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm w-full block font-medium mb-4 ">
              Precio Desde
            </label>
            <div className="w-full flex">
              <select
                value={modelCreate?.moneda}
                onChange={(e) =>
                  handleModelChangeCreate("moneda", e.target.value)
                }
                name=""
                className="bg-gray-200 rounded px-3 py-2 text-sm"
                id="moneda"
              >
                <option value="PEN">S/</option>
                <option value="DOLLAR">$</option>
              </select>
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="number"
                value={modelCreate?.precio}
                onChange={(e) =>
                  handleModelChangeCreate("precio", e.target.value)
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4">
              Área Desde
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="number"
              value={modelCreate?.area}
              onChange={(e) => handleModelChangeCreate("area", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4">
              N° Habitaciones
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="number"
              value={modelCreate?.habs}
              onChange={(e) => handleModelChangeCreate("habs", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4">
              Garage
            </label>
            <Switch
              value={Number(modelCreate?.garage) === 1 ? true : false}
              onChange={(e) => handleModelChangeCreate("garage", e)}
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4">
              Baños
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="number"
              value={modelCreate?.banios}
              onChange={(e) =>
                handleModelChangeCreate("banios", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium mb-4">
              Unidades
            </label>
            <div className="flex flex-grap gap-3 items-start">
              <div>
                <input
                  className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={prefijo}
                  onChange={(e) => setPrefijo(e.target.value)}
                />
                <label htmlFor="">Prefijo</label>
              </div>
              <div>
                <input
                  className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                  type="number"
                  value={numberUnidades}
                  onChange={(e) => setNumberUnidades(e.target.value)}
                />
                <label htmlFor="">Cantidad</label>
              </div>
              <button
                onClick={() => handleCreateUnidades()}
                className="p-2 text-white bg-dark-purple rounded whitespace-nowrap text-xs inline-block h-max"
              >
                Crear
              </button>
              <button
                onClick={() => handleResetUnidades()}
                className="p-2 text-white bg-orange-500 rounded whitespace-nowrap text-xs inline-block h-max"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
        <div
          className={`w-full grid-cols-1 gap-2 mt-4 bg-white px-4 py-3 rounded md:col-span-4 ${
            unidades.length > 0 ? "" : "hidden"
          }`}
        >
          <label className="text-sm w-full block font-medium my-4">
            Unidades
          </label>
          {unidades.map((unit, unitIndex) => (
            <div key={unitIndex} className="flex gap-2 w-full">
              <div className="">
                <label className="text-sm w-full block font-medium">#</label>
                <span>{unitIndex + 1}</span>
              </div>
              <div className="w-full">
                <label className="text-sm w-full block font-medium">
                  Nombre
                </label>
                <input
                  className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                  type="text"
                  value={unit.nombre}
                  onChange={(e) => handleUnitChange(unitIndex, e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="text-sm w-full block font-medium">
                  status
                </label>
                <select
                  className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                  name=""
                  id="unidades"
                  value={unit.status}
                  onChange={(e) => handleUnitChange(unitIndex, e.target.value)}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Separado">Separado</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => handleOkCreate()}
            className="bg-dark-purple text-white p-3 rounded"
          >
            Crear Modelo
          </button>
        </div>
      </Modal>
      <div className="box-table">
        <table
          className="inmocms-table"
          cellPadding="0"
          cellSpacing="0"
          border="0"
        >
          <thead>
            <tr>
              <td className="check-field">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={visibleModelos.every((modelo) =>
                    selectsModelos.includes(modelo.id)
                  )}
                />
              </td>
              <td>Nombre </td>
              <td>Categoria </td>
              <td>Precio </td>
              <td>Area </td>
              <td>Imagen </td>
              <td>Habs </td>
              <td>Garage </td>
              <td>Banios </td>
              <td>Etapa </td>
              <td>Unidades </td>
              <td className="ajustes-tabla-celda"></td>
            </tr>
          </thead>
          <tbody>
            {visibleModelos.length > 0 &&
              visibleModelos.map((modelo, index) => {
                return (
                  <tr
                    className=""
                    key={index}
                    onClick={() => handleSelect(modelo.id)}
                  >
                    <td className="check-field">
                      <input
                        type="checkbox"
                        value={modelo.id}
                        onClick={(e) => handleCheckSelect(e, modelo.id)}
                        checked={selectsModelos.find((s) => {
                          if (s === modelo.id) {
                            return true;
                          }
                        })}
                      />
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {modelo.nombre}
                        {/* <span className="small-size green">{modelo.purpose}</span> */}
                      </div>
                    </td>
                    <td>{modelo.categoria || "Sin categoria"}</td>
                    <td className="whitespace-no-wrap">
                      {modelo.moneda === "DOLLAR" ? modelo.precio : null}{" "}
                      {modelo.moneda === "DOLLAR" ? "$" : "S/"}{" "}
                      {modelo.moneda === "PEN" ? modelo.precio : null}
                    </td>
                    <td>
                      <div className="whitespace-no-wrap">{modelo.area}</div>
                    </td>
                    <td>
                      <div
                        className="foto"
                        style={{
                          backgroundImage: `url('${modelo.imagenUrl}')`,
                        }}
                      ></div>
                    </td>
                    <td>{modelo.habs}</td>
                    <td>{Number(modelo.garage) === 1 ? "SI" : "NO"}</td>
                    <td>{modelo.banios}</td>

                    <td>{modelo.etapa}</td>
                    <td>
                      {modelo.cantidad_unidades_totales} unidades <br />{" "}
                      {modelo.cantidad_unidades_disponibles} disponibles
                    </td>

                    <td className="ajustes-tabla-celda">
                      <div className="ajustes-tabla-celda-item px-4">
                        <Dropdown
                          className="text-sm text-bold-font"
                          placement="bottomRight"
                          menu={{
                            items: [
                              {
                                label: (
                                  <div
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-900 "
                                    onClick={(e) =>
                                      abrirModalEdit(e, modelo.id)
                                    }
                                  >
                                    <FaEdit /> Editar
                                  </div>
                                ),
                                key: 0,
                              },
                              {
                                label: (
                                  <div
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-red-500 "
                                    onClick={(e) =>
                                      handleEliminarModelo(e, modelo.id)
                                    }
                                  >
                                    <FaTrash /> Eliminar
                                  </div>
                                ),
                                key: 1,
                              },
                              {
                                label: (
                                  <div
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-900 "
                                    onClick={(e) =>
                                      handleViewUnidades(e, modelo.id)
                                    }
                                  >
                                    <BsViewList /> Ver Unidades
                                  </div>
                                ),
                                key: 2,
                              },
                            ],
                          }}
                          trigger={["click"]}
                        >
                          <div
                            className="text-xs w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Space>
                              <FaEllipsisV />
                            </Space>
                          </div>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {visibleModelos.length === 0 ? (
          <p className="w-full text-center text-xs py-4">
            No hay modelos creados para esta propiedad
          </p>
        ) : null}
      </div>
      <div className="table-controls">
        <div className="page">
          <div className="txt">
            Página {currentPage} de {totalPages}
          </div>
          <div style={{ marginBottom: "12px", marginRight: "24px" }}>
            <Select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e));
                setCurrentPage(1); // Reset page to 1 on items per page change
              }}
              // style={{
              //   width: 120,
              // }}
              // dropdownMatchSelectWidth={false}
              placement={"topLeft"}
              options={[
                {
                  value: "1",
                  label: "1",
                },
                {
                  value: "10",
                  label: "10",
                },
                {
                  value: "25",
                  label: "25",
                },
                {
                  value: "50",
                  label: "50",
                },
                {
                  value: "100",
                  label: "100",
                },
                {
                  value: "500",
                  label: "500",
                },
              ]}
            />
          </div>
          <div className="disabled" style={{ marginBottom: "12px" }}>
            <Dropdown
              menu={{ items }}
              placement="bottomLeft"
              trigger={["click"]}
              disabled={selectsModelos.length > 0 ? false : true}
            >
              <Button>
                Acciones <TbCaretDownFilled />
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="pagination-controls flex gap-2 items-center">
          <button
            className={`p-3 text-xs rounded ${
              currentPage === 1
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            1
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === 1
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <button className="p-3 rounded bg-dark-purple text-white text-xs">
            {currentPage}
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === totalPages
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            className={`p-3 text-xs rounded ${
              currentPage === totalPages
                ? "bg-light-purple text-dark-purple"
                : "bg-dark-purple text-white"
            }  `}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            {totalPages}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyModelos;
