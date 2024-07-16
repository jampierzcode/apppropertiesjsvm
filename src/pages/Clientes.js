import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button, DatePicker, Dropdown, Input, Select } from "antd";
import { MdAdd, MdOutlineHomeWork } from "react-icons/md";
import { TbAdjustments, TbCaretDownFilled } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";
import dayjs from "dayjs";
import { FaFileExcel, FaUsers } from "react-icons/fa";
const { Option } = Select;
const { RangePicker } = DatePicker;
const Clientes = () => {
  const session = JSON.parse(sessionStorage.getItem("session"));
  const apiUrl = process.env.REACT_APP_API_URL;

  const [clientes, setClientes] = useState([]);
  const [filterClientes, setFilterClientes] = useState([]);

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
  const buscarClientes = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/clientesbyuser/${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );
      setClientes(response.data);

      setFilterClientes(response.data);
    } catch (error) {
      console.log("Error al obtener las clientes:", error);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line
    buscarClientes();
  }, [0]);
  // ESTADOS PARA LA TABLA DINAMICA
  const [selectsClientes, setSelectsClientes] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); //items por pagina
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleClientes, setVisibleClientes] = useState([]);
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
  const exportExcel = () => {
    // Crear una hoja de trabajo (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(clientes);
    // Crear un libro de trabajo (workbook)
    const workbook = XLSX.utils.book_new();
    // Agregar la hoja de trabajo al libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    // Generar un archivo Excel
    XLSX.writeFile(workbook, "clientes_sistema.xlsx");
  };
  // Función para aplicar el filtro
  const detectarTotalPages = (data) => {
    if (data.length === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  };
  const applyFilters = () => {
    const filteredClientes = filterClientes.filter((cliente) => {
      const searchRegex = new RegExp(searchTerm, "i");

      const matchSearch = Object.values(cliente).some((value) =>
        searchRegex.test(value.toString())
      );

      return matchSearch;
    });

    detectarTotalPages(filteredClientes);
    const startIndex = (currentPage - 1) * itemsPerPage;
    // setCurrentPage(1);
    const paginatedProperties = filteredClientes.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleClientes(paginatedProperties);
  };

  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    applyFilters(); // Aplicar filtro inicialmente
  }, [filterClientes, currentPage, itemsPerPage, searchTerm]);

  const handleSelect = (id) => {
    setSelectsClientes((prevSelects) => {
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
      setSelectsClientes((prevSelects) => [...prevSelects, id]);
    } else {
      setSelectsClientes((prevSelects) => prevSelects.filter((p) => p !== id));
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const visiblePropertyIds = visibleClientes.map((propiedad) => propiedad.id);

    if (isChecked) {
      setSelectsClientes((prevSelects) => [
        ...new Set([...prevSelects, ...visiblePropertyIds]),
      ]);
    } else {
      setSelectsClientes((prevSelects) =>
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
    detectarTotalPages(filterClientes);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filterClientes.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    setVisibleClientes(paginatedProperties);
  };

  return (
    <div className="w-full p-6 app-container-sections">
      <div
        className="mb-[32px] flex items-center justify-between py-4 pr-4"
        style={{ background: "linear-gradient(90deg,#fff0,#fff)" }}
      >
        <div className="data">
          <div className="title font-bold text-xl text-bold-font">Clientes</div>
          <div className="subtitle max-w-[30vw] text-xs font-normal text-light-font">
            Clientes que llenaron el formulario de contacto
          </div>
        </div>
        <div className="options bg-gray-50 p-4">
          <div className="page-top-card flex items-center gap-3">
            <div className="icon bg-light-purple p-4 rounded text-dark-purple">
              <FaUsers />
            </div>
            <div>
              <div className="value font-bold text-bold-font text-xl">
                {clientes.length}
              </div>
              <div className="text-sm font-normal text-light-font">
                Total clientes
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
        <div className="horizontal-options-items ml-[28px] flex items-center gap-1">
          <button
            onClick={() => exportExcel()}
            className="inmocms-button bg-green-600 text-white rounded p-3 flex gap-1 items-center text-xs"
          >
            <FaFileExcel /> Exportar
          </button>
          <button
            className="p-3 rounded bg-gray-200 text-bold-font text-xs"
            onClick={() => handleClearFilters()}
          >
            Resetear
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
                  checked={visibleClientes.every((cliente) =>
                    selectsClientes.includes(cliente.id)
                  )}
                />
              </td>
              <td align="center">Propiedad</td>
              <td>Nombres </td>
              <td>Apellidos </td>
              <td>Email </td>
              <td>Celular</td>
              <td>Mensaje </td>
              <td className="ajustes-tabla-celda"></td>
            </tr>
          </thead>
          <tbody>
            {visibleClientes.length > 0 &&
              visibleClientes.map((cliente, index) => {
                return (
                  <tr
                    className=""
                    key={index}
                    onClick={() => handleSelect(cliente.id)}
                  >
                    <td className="check-field">
                      <input
                        type="checkbox"
                        value={cliente.id}
                        onClick={(e) => handleCheckSelect(e, cliente.id)}
                        checked={selectsClientes.find((s) => {
                          if (s === cliente.id) {
                            return true;
                          }
                        })}
                      />
                    </td>
                    <td>
                      <div className="flex flex-col align-center text-center">
                        {cliente.nombre_propiedad}
                      </div>
                    </td>
                    <td>{cliente.nombres}</td>
                    <td>{cliente.apellidos}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.celular}</td>
                    <td className="whitespace-no-wrap">{cliente.mensaje}</td>

                    <td className="ajustes-tabla-celda">
                      <div className="ajustes-tabla-celda-item">
                        {/* opciones icono agregar con evento */}
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
              disabled={selectsClientes.length > 0 ? false : true}
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

export default Clientes;
