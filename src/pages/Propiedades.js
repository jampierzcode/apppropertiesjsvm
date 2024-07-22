import React, { useEffect, useState } from "react";
import { Button, DatePicker, Dropdown, Input, Select, Space } from "antd";
import { MdAdd } from "react-icons/md";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { Link, NavLink } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";
import dayjs from "dayjs";
import {
  FaBuilding,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { BsViewList } from "react-icons/bs";
import { FiImage } from "react-icons/fi";
const { Option } = Select;
const { RangePicker } = DatePicker;
const Propiedades = () => {
  const session = JSON.parse(sessionStorage.getItem("session"));
  const apiUrl = process.env.REACT_APP_API_URL;
  // console.log(apiUrl);
  const [propiedades, setPropiedades] = useState([]);
  const [filterPropiedades, setFilterPropiedades] = useState([]);

  const items = [
    {
      key: "1",
      label: (
        <p
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          Editar
        </p>
      ),
    },
  ];
  const buscarPropiedades = async () => {
    try {
      const response = await axios.get(`${apiUrl}/propiedades`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      setPropiedades(response.data);
      setFilterPropiedades(response.data);
    } catch (error) {
      console.error("Error al obtener las propiedades:", error);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line
    buscarPropiedades();
  }, [0]);
  // ESTADOS PARA LA TABLA DINAMICA
  const [selectsProperties, setSelectsProperties] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState({
    tipo: "",
    precioRange: [0, Infinity],
    pais: "",
    region: "",
    provincia: "",
    distrito: "",
    fechaCreatedRange: [null, null],
    fechaEntregaRange: [null, null],
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
    const regex = /^[a-zA-Z0-9\s]*$/; // Permite solo letras, números y espacios
    const bol = regex.test(searchTerm) ? searchTerm : "";

    if (bol === "") {
      const filteredProperties = filterPropiedades.filter((propiedad) => {
        const searchRegex = new RegExp(searchTerm, "i");

        const matchSearch = Object.values(propiedad).some((value) =>
          searchRegex.test(value.toString())
        );

        const matchFilters =
          (!filters.tipo || propiedad.tipo === filters.tipo) &&
          propiedad.precio_from >= filters.precioRange[0] &&
          propiedad.precio_from <= filters.precioRange[1] &&
          (!filters.pais || propiedad.pais === filters.pais) &&
          (!filters.region || propiedad.region_name === filters.region) &&
          (!filters.provincia ||
            propiedad.provincia_name === filters.provincia) &&
          (!filters.distrito || propiedad.distrito_name === filters.distrito) &&
          (!filters.fechaCreatedRange[0] ||
            ((dayjs(propiedad.fecha_created).isAfter(
              filters.fechaCreatedRange[0],
              "day"
            ) ||
              dayjs(propiedad.fecha_created).isSame(
                filters.fechaCreatedRange[0],
                "day"
              )) &&
              (dayjs(propiedad.fecha_created).isBefore(
                filters.fechaCreatedRange[1],
                "day"
              ) ||
                dayjs(propiedad.fecha_created).isSame(
                  filters.fechaCreatedRange[1],
                  "day"
                )))) &&
          (!filters.fechaEntregaRange[0] ||
            ((dayjs(propiedad.fecha_entrega).isAfter(
              filters.fechaEntregaRange[0],
              "day"
            ) ||
              dayjs(propiedad.fecha_entrega).isSame(
                filters.fechaEntregaRange[0],
                "day"
              )) &&
              (dayjs(propiedad.fecha_entrega).isBefore(
                filters.fechaEntregaRange[1],
                "day"
              ) ||
                dayjs(propiedad.fecha_entrega).isSame(
                  filters.fechaEntregaRange[1],
                  "day"
                ))));

        return matchSearch && matchFilters;
      });
      detectarTotalPages(filteredProperties);
      const objetosOrdenados = filteredProperties.sort((a, b) =>
        dayjs(b.fecha_created).isAfter(dayjs(a.fecha_created)) ? 1 : -1
      );
      const startIndex = (currentPage - 1) * itemsPerPage;
      // setCurrentPage(1);
      const paginatedProperties = objetosOrdenados.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setVisibleProperties(paginatedProperties);
    } else {
      searchTerm(bol);
    }
  };

  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterPropiedades, currentPage, itemsPerPage, searchTerm]);

  const handleSelect = (id) => {
    setSelectsProperties((prevSelects) => {
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
      setSelectsProperties((prevSelects) => [...prevSelects, id]);
    } else {
      setSelectsProperties((prevSelects) =>
        prevSelects.filter((p) => p !== id)
      );
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const visiblePropertyIds = visibleProperties.map(
      (propiedad) => propiedad.id
    );

    if (isChecked) {
      setSelectsProperties((prevSelects) => [
        ...new Set([...prevSelects, ...visiblePropertyIds]),
      ]);
    } else {
      setSelectsProperties((prevSelects) =>
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
    detectarTotalPages(filterPropiedades);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filterPropiedades.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleProperties(paginatedProperties);
  };
  const handleEditarProperty = (e, id) => {
    e.stopPropagation();
    console.log(id);
  };
  const handleEliminarProperty = (e, id) => {
    e.stopPropagation();
    console.log(id);
  };

  return (
    <div className="w-full p-6 app-container-sections">
      <div
        className="mb-[32px] flex items-center justify-between py-4 pr-4"
        style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
      >
        <div className="data">
          <div className="title font-bold text-xl text-bold-font">
            Propiedades
          </div>
          <div className="subtitle max-w-[30vw] text-xs font-normal text-light-font">
            Localiza el inmueble ideal.
          </div>
        </div>
        <div className="options bg-gray-50 p-4">
          <div className="page-top-card flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <FaBuilding />
            </div>
            <div>
              <div className="value font-bold text-bold-font text-xl">
                {propiedades.length}
              </div>
              <div className="text-sm font-normal text-light-font">
                Total inmuebles
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
              placeholder="Buscar propiedad"
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
          <NavLink className="" to={"/propiedades/nuevo"}>
            <button className="btn-new ml-[12px] h-[46px] flex gap-2 items-center">
              <MdAdd className="text-white" />
              <span className="mobile-hide">Añadir propiedad</span>
            </button>
          </NavLink>
        </div>
      </div>
      <div
        className={`${
          activeFilter ? "" : "hidden"
        } filters grid grid-cols-1 md:grid-cols-6 gap-4 bg-white py-4 px-3 mb-4`}
      >
        <Select
          className="w-full text-sm"
          value={filters.tipo}
          onChange={(value) => handleFiltersChange({ tipo: value })}
          placeholder="Tipo"
        >
          <Option value="">Todos</Option>
          {/* Agrega opciones según tus tipos */}
          <Option value="Casa">Casa</Option>
          <Option value="Departamento">Departamento</Option>
          <Option value="Oficina">Oficina</Option>
          <Option value="Lote">Lote</Option>
        </Select>
        <Input
          className="w-full text-sm"
          type="number"
          placeholder="Precio mínimo"
          value={filters.precioRange[0] === 0 ? "" : filters.precioRange[0]}
          onChange={(e) =>
            handleFiltersChange({
              precioRange: [Number(e.target.value), filters.precioRange[1]],
            })
          }
        />
        <Input
          className="w-full text-sm"
          type="number"
          placeholder="Precio máximo"
          value={
            filters.precioRange[1] === Infinity ? "" : filters.precioRange[1]
          }
          onChange={(e) =>
            handleFiltersChange({
              precioRange: [filters.precioRange[0], Number(e.target.value)],
            })
          }
        />
        <Input
          className="w-full text-sm"
          placeholder="País"
          value={filters.pais}
          onChange={(e) => handleFiltersChange({ pais: e.target.value })}
        />
        <Input
          className="w-full text-sm"
          placeholder="Región"
          value={filters.region}
          onChange={(e) => handleFiltersChange({ region: e.target.value })}
        />
        <Input
          className="w-full text-sm"
          placeholder="Provincia"
          value={filters.provincia}
          onChange={(e) => handleFiltersChange({ provincia: e.target.value })}
        />
        <Input
          className="w-full text-sm"
          placeholder="Distrito"
          value={filters.distrito}
          onChange={(e) => handleFiltersChange({ distrito: e.target.value })}
        />
        <div className="col-span-2">
          <RangePicker
            className="w-full text-sm"
            value={filters.fechaCreatedRange}
            onChange={(dates) =>
              handleFiltersChange({ fechaCreatedRange: dates })
            }
            placeholder={["Fecha Creación Desde", "Fecha Creación Hasta"]}
          />
        </div>
        <div className="col-span-2">
          <RangePicker
            className="w-full text-sm"
            value={filters.fechaEntregaRange}
            onChange={(dates) => {
              if (dates === null) {
                handleFiltersChange({ fechaEntregaRange: [null, null] });
              } else {
                handleFiltersChange({ fechaEntregaRange: dates });
              }
            }}
            placeholder={["Fecha Entrega Desde", "Fecha Entrega Hasta"]}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row">
          <button
            className="p-3 rounded bg-white text-light-font text-xs"
            onClick={() => handleClearFilters()}
          >
            Limpiar
          </button>
          <button
            className="p-3 rounded bg-dark-purple text-white text-xs"
            onClick={() => applyFilters()}
          >
            Buscar
          </button>
        </div>
      </div>
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
                  checked={visibleProperties.every((propiedad) =>
                    selectsProperties.includes(propiedad.id)
                  )}
                />
              </td>
              <td align="center">Ref.</td>
              <td>Tipo </td>
              <td>Ubicacion </td>
              <td>Direccion Exacta </td>
              <td>Hab. </td>
              <td>Baños </td>
              <td>Garaje </td>
              <td>Precio </td>
              <td>Logo</td>
              <td>Estado </td>
              <td className="ajustes-tabla-celda"></td>
            </tr>
          </thead>
          <tbody>
            {visibleProperties.length > 0 &&
              visibleProperties.map((propiedad, index) => {
                return (
                  <tr
                    className=""
                    key={index}
                    onClick={() => handleSelect(propiedad.id)}
                  >
                    <td className="check-field">
                      <input
                        type="checkbox"
                        value={propiedad.id}
                        onClick={(e) => handleCheckSelect(e, propiedad.id)}
                        checked={selectsProperties.find((s) => {
                          if (s === propiedad.id) {
                            return true;
                          }
                        })}
                      />
                    </td>
                    <td>
                      <div className="flex flex-col align-center">
                        {propiedad.nombre}
                        <span className="small-size green font-bold">
                          {propiedad.purpose}
                        </span>
                      </div>
                    </td>
                    <td>{propiedad.tipo}</td>
                    <td className="whitespace-no-wrap">
                      {propiedad.exactAddress === null
                        ? ""
                        : propiedad.exactAddress}
                      <br />
                      <p className="font-bold">
                        {propiedad.region_name}
                        {", "}
                        {propiedad.provincia_name}
                        {", "}
                        {propiedad.distrito_name}
                      </p>
                    </td>
                    <td>
                      <div className="whitespace-no-wrap">
                        {propiedad.exactAddress}
                      </div>
                    </td>
                    <td>{propiedad.habs === null ? "0" : propiedad.habs}</td>
                    <td>1</td>
                    <td>Si</td>
                    <td className="whitespace-no-wrap">
                      {propiedad.moneda === "DOLLAR"
                        ? propiedad.precio_from
                        : null}
                      {propiedad.moneda === "DOLLAR" ? "$" : "S/"}
                      {propiedad.moneda === "PEN"
                        ? propiedad.precio_from
                        : null}
                    </td>
                    <td>
                      <div
                        className="foto"
                        style={{
                          backgroundImage: `url('${propiedad.logo}')`,
                        }}
                      ></div>
                    </td>
                    <td>
                      <div style={{ textAlign: "center" }}>
                        <div>
                          <span className="estado publicado">
                            {propiedad.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="ajustes-tabla-celda">
                      <div className="ajustes-tabla-celda-item px-4">
                        <Dropdown
                          className="text-sm text-gray-500"
                          placement="bottomRight"
                          menu={{
                            items: [
                              {
                                label: (
                                  <Link
                                    target="_blank"
                                    to={`/proyectos/${propiedad.id}`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500"
                                  >
                                    <FaEye /> Ver Propiedad
                                  </Link>
                                ),
                                key: 0,
                              },
                              {
                                label: (
                                  <Link
                                    to={`/propiedades/editar/${propiedad.id}`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500"
                                  >
                                    <FaEdit /> Editar info
                                  </Link>
                                ),
                                key: 1,
                              },
                              {
                                label: (
                                  <div
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500 text-red-500 "
                                    onClick={(e) =>
                                      handleEliminarProperty(e, propiedad.id)
                                    }
                                  >
                                    <FaTrash /> Eliminar
                                  </div>
                                ),
                                key: 2,
                              },
                              {
                                label: (
                                  <Link
                                    to={`/property/${propiedad.id}/models`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500 "
                                  >
                                    <BsViewList /> Ver Modelos
                                  </Link>
                                ),
                                key: 3,
                              },
                              {
                                label: (
                                  <Link
                                    to={`/property/${propiedad.id}/multimedia`}
                                    className="pr-6 rounded flex items-center gap-2 text-sm text-gray-500 "
                                  >
                                    <FiImage /> Multimedia
                                  </Link>
                                ),
                                key: 4,
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
              disabled={selectsProperties.length > 0 ? false : true}
            >
              <Button>
                Editar selección <TbCaretDownFilled />
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

export default Propiedades;
