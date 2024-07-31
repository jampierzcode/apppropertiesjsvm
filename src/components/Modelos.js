import { Switch } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdAdd } from "react-icons/md";

const categorias = ["Sin categoría", "Flat", "Duplex", "Triplex", "Penthouse"];

const Modelos = ({ models, setModels }) => {
  const [newModelCount, setNewModelCount] = useState(0);

  const handleNewModelCountChange = (e) => {
    setNewModelCount(parseInt(e.target.value, 10));
  };

  const handleAddModels = () => {
    const newModels = Array(newModelCount)
      .fill()
      .map((_, i) => ({
        categoria: "",
        nombre: "",
        imagenUrl: "",
        precio: "",
        moneda: "PEN",
        area: "",
        habs: 0,
        garage: false,
        banios: 0,
        etapa: "En planos",
        unidades: [],
      }));
    setModels([...models, ...newModels]);
    setNewModelCount(1); // reset new model count
  };

  const handleModelChange = (index, field, value) => {
    const updatedModels = models.map((model, i) =>
      i === index ? { ...model, [field]: value } : model
    );
    setModels(updatedModels);
  };

  const handleUnitCountChange = (modelIndex, unitCount) => {
    const updatedModels = models.map((model, i) =>
      i === modelIndex
        ? {
            ...model,
            unidades: Array(unitCount)
              .fill()
              .map((_, j) => ({ nombre: ``, status: "Disponible" })),
          }
        : model
    );
    setModels(updatedModels);
    console.log(updatedModels);
  };

  const handleUnitChange = (modelIndex, unitIndex, value) => {
    const updatedModels = models.map((model, i) =>
      i === modelIndex
        ? {
            ...model,
            unidades: model.unidades.map((unit, j) =>
              j === unitIndex ? { ...unit, nombre: value } : unit
            ),
          }
        : model
    );
    setModels(updatedModels);
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      //   handleModelChange(index, "imagenUrl", reader.result);
      const updatedModels = models.map((model, i) =>
        i === index
          ? { ...model, imagen: file, imagenUrl: reader.result }
          : model
      );
      setModels(updatedModels);
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveModel = (index) => {
    setModels((prevModels) => prevModels.filter((_, i) => i !== index));
  };


  return (
    <div className="boxPropie mb-6">
      <h3 className="text-md font-medium text-bold-font mb-4">Modelos</h3>
      <div className="model-count flex items-start h-[46px]">
        <input
          className="p-2 bg-gray-200 h-full w-[50px]"
          type="number"
          id="modelCount"
          value={newModelCount}
          onChange={handleNewModelCountChange}
        />
        <button
          className="btn-new h-[46px] flex gap-2 items-center"
          onClick={handleAddModels}
        >
          <MdAdd className="text-white" />
          <span className="mobile-hide">Nuevo modelo</span>
        </button>
      </div>
      {models.map((model, modelIndex) => (
        <div
          key={modelIndex}
          className="model grid grid-cols-1 md:grid-cols-4 gap-3 px-6 py-4 rounded bg-gray-100 mt-4 relative"
        >
          <button
            className="w-5 shadow h-5 absolute top-0 right-0 rounded border border-red-500 bg-red-200 text-red-500 text-sm inline-flex items-center justify-center"
            onClick={() => handleRemoveModel(modelIndex)}
          >
            <FaTrash />
          </button>

          <div className="md:col-span-2">
            <label className="text-sm w-full block font-medium ">
              Subir Imagen
            </label>
            <div className="w-full flex items-center gap-3">
              {model.imagenUrl && (
                <img
                  src={model.imagenUrl}
                  alt={`Modelo ${modelIndex + 1}`}
                  className="w-10"
                />
              )}
              <input
                className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
                type="file"
                onChange={(e) => handleImageUpload(modelIndex, e)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm w-full block font-medium">
              Categoría
            </label>
            <select
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              value={model.categoria}
              onChange={(e) =>
                handleModelChange(modelIndex, "categoria", e.target.value)
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
            <label className="text-sm w-full block font-medium">Nombre</label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="text"
              value={model.nombre}
              onChange={(e) =>
                handleModelChange(modelIndex, "nombre", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium">Etapa</label>
            <select
              name=""
              id="estado_modelo"
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              value={model.etapa}
              onChange={(e) =>
                handleModelChange(modelIndex, "etapa", e.target.value)
              }
            >
              <option value="En planos">En planos</option>
              <option value="Construccion">Construccion</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
          <div>
            <label className="text-sm w-full block font-medium">
              Precio Desde
            </label>
            <div className="w-full flex">
              <select
                value={model.moneda}
                onChange={(e) =>
                  handleModelChange(modelIndex, "moneda", e.target.value)
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
                value={model.precio}
                onChange={(e) =>
                  handleModelChange(modelIndex, "precio", e.target.value)
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm w-full block font-medium">
              Área Desde
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="text"
              value={model.area}
              onChange={(e) =>
                handleModelChange(modelIndex, "area", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium">
              N° Habitaciones
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="text"
              value={model.habs}
              onChange={(e) =>
                handleModelChange(modelIndex, "habs", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium">Garage</label>
            <Switch
              value={model.garage}
              onChange={(e) => handleModelChange(modelIndex, "garage", e)}
            />
          </div>
          <div>
            <label className="text-sm w-full block font-medium">Baños</label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="text"
              value={model.banios}
              onChange={(e) =>
                handleModelChange(modelIndex, "banios", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm w-full block font-medium">
              N° Unidades
            </label>
            <input
              className="bg-gray-200 rounded px-3 py-2 w-full text-sm"
              type="number"
              min={0}
              value={model.unidades.length}
              onChange={(e) =>
                handleUnitCountChange(modelIndex, parseInt(e.target.value, 10))
              }
            />
          </div>
          <div
            className={`w-full grid-cols-1 gap-2 mt-4 bg-white px-4 py-3 rounded md:col-span-4 ${
              model.unidades.length > 0 ? "" : "hidden"
            }`}
          >
            <label className="text-sm w-full block font-medium my-4">
              Unidades
            </label>
            {model.unidades.map((unit, unitIndex) => (
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
                    onChange={(e) =>
                      handleUnitChange(modelIndex, unitIndex, e.target.value)
                    }
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
                    onChange={(e) =>
                      handleUnitChange(modelIndex, unitIndex, e.target.value)
                    }
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Separado">Separado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* <pre>{JSON.stringify(models, null, 2)}</pre> */}
    </div>
  );
};

export default Modelos;
