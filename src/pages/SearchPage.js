import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaBath, FaBed, FaMapMarkerAlt, FaVectorSquare } from "react-icons/fa";
import MapFilter from "../components/MapFilter";
import { Select, Slider } from "antd";
import { useSharedData } from "../components/SharedDataContext";
const { Option } = Select;
const SearchPage = () => {
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
  const { query } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;
  const getPurposeAndCategories = () => {
    let parts = [];
    let categories = [];
    let ubicaciones = [];
    let minPrice = null;
    let maxPrice = null;
    let currency = null;
    if (
      !query.includes("-en-") &&
      !query.includes("desde") &&
      !query.includes("hasta")
    ) {
      categories = query.split("-de-")[1].split("-o-");
    }
    if (
      query.includes("-en-") &&
      query.includes("desde") &&
      query.includes("hasta")
    ) {
      parts = query.split("-en-");
      parts.slice(1, -1).map((ubi) => {
        ubicaciones.push(ubi);
      });

      categories = parts[0].split("-de-")[1].split("-o-");

      const lastPart = parts[parts.length - 1];
      const lastUbicacionDesde = lastPart.split("-desde-");

      ubicaciones.push(lastUbicacionDesde[0]);
      const priceParts = lastUbicacionDesde[1].split("-");

      minPrice = priceParts[0];

      const toIndex = priceParts.indexOf("hasta");

      if (toIndex !== -1) {
        maxPrice = priceParts[toIndex + 1];
      }

      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }
    if (
      query.includes("-en-") &&
      !query.includes("desde") &&
      query.includes("hasta")
    ) {
      parts = query.split("-en-");
      parts.slice(1, -1).map((ubi) => {
        ubicaciones.push(ubi);
      });

      categories = parts[0].split("-de-")[1].split("-o-");

      const lastPart = parts[parts.length - 1];
      const lastUbicacionHasta = lastPart.split("-hasta-");

      ubicaciones.push(lastUbicacionHasta[0]);
      const priceParts = lastUbicacionHasta[1].split("-");

      maxPrice = priceParts[0];

      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }
    if (
      query.includes("-en-") &&
      query.includes("desde") &&
      !query.includes("hasta")
    ) {
      parts = query.split("-en-");
      parts.slice(1, -1).map((ubi) => {
        ubicaciones.push(ubi);
      });

      categories = parts[0].split("-de-")[1].split("-o-");

      const lastPart = parts[parts.length - 1];
      const lastUbicacionDesde = lastPart.split("-desde-");

      ubicaciones.push(lastUbicacionDesde[0]);
      const priceParts = lastUbicacionDesde[1].split("-");

      minPrice = priceParts[0];

      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }
    if (
      query.includes("-en-") &&
      !query.includes("desde") &&
      !query.includes("hasta")
    ) {
      parts = query.split("-en-");

      categories = parts[0].split("-de-")[1].split("-o-");

      parts.slice(1).map((ubi) => {
        ubicaciones.push(ubi);
      });
    }
    if (
      !query.includes("-en-") &&
      query.includes("desde") &&
      query.includes("hasta")
    ) {
      parts = query.split("-desde-");
      categories = parts[0].split("-de-")[1].split("-o-");

      const priceParts = parts[1].split("-");

      minPrice = priceParts[0];
      const toIndex = priceParts.indexOf("hasta");

      if (toIndex !== -1) {
        maxPrice = priceParts[toIndex + 1];
      }

      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }
    if (
      !query.includes("-en-") &&
      query.includes("desde") &&
      !query.includes("hasta")
    ) {
      parts = query.split("-desde-");
      categories = parts[0].split("-de-")[1].split("-o-");

      const priceParts = parts[1].split("-");

      minPrice = priceParts[0];

      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }
    if (
      !query.includes("-en-") &&
      !query.includes("desde") &&
      query.includes("hasta")
    ) {
      parts = query.split("-hasta-");
      categories = parts[0].split("-de-")[1].split("-o-");

      const priceParts = parts[1].split("-");
      maxPrice = priceParts[0];
      const currencyIndex = priceParts.findIndex(
        (part) => part === "pen" || part === "dollar"
      );
      if (currencyIndex !== -1) {
        currency = priceParts[currencyIndex];
      }
    }

    const locations = ubicaciones.map((location) => {
      const partsUbi = location.split("-");
      let ubicacion = {
        regionName: "",
        provinciaName: "",
        distritoName: "",
        codes: "",
      };
      let lengPartsUbi = partsUbi.length;
      switch (lengPartsUbi) {
        case 2:
          ubicacion.regionName = partsUbi[0];
          ubicacion.codes = partsUbi[1];

          break;
        case 3:
          ubicacion.regionName = partsUbi[0];
          ubicacion.provinciaName = partsUbi[1];
          ubicacion.codes = partsUbi[2];

          break;
        case 4:
          ubicacion.regionName = partsUbi[0];
          ubicacion.provinciaName = partsUbi[1];
          ubicacion.distritoName = partsUbi[2];
          ubicacion.codes = partsUbi[3];

          break;

        default:
          break;
      }

      return ubicacion;
    });

    return { categories, locations, minPrice, maxPrice, currency };
  };

  const { categories, locations, minPrice, maxPrice, currency } =
    getPurposeAndCategories();
  const [propiedades, setPropiedades] = useState([]);
  const [filterPropiedades, setFilterPropiedades] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    categories || []
  );
  const [selectedLocations, setSelectedLocations] = useState(locations || []);
  const [priceRange, setPriceRange] = useState([
    minPrice === null ? 0 : minPrice,
    maxPrice === null ? Infinity : maxPrice,
  ]);

  const buscarPropiedades = async () => {
    try {
      const response = await axios.get(`${apiUrl}/propiedades`);
      setPropiedades(response.data);
    } catch (error) {
      console.error("Error al obtener las propiedades:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    buscarPropiedades();
  }, [0]);
  const [ubicacionesMapa, setUbicacionesMapa] = useState([]);
  const applyFilters = () => {
    const filterSesgo =
      selectedLocations.length > 0
        ? selectedLocations
        : [{ regionName: "", provinciaName: "", distritoName: "" }];
    console.log(selectedLocations);
    const filteredProperties =
      propiedades.length > 0 &&
      propiedades.filter((propiedad) => {
        const matchFilters =
          (!selectedCategories.length ||
            selectedCategories.includes(propiedad.tipo.toLowerCase())) &&
          propiedad.precio_from >= priceRange[0] &&
          propiedad.precio_from <= priceRange[1] &&
          filterSesgo.some(
            (ubi) =>
              (!ubi.regionName || propiedad.region_name === ubi.regionName) &&
              (!ubi.provinciaName ||
                propiedad.provincia_name === ubi.provinciaName) &&
              (!ubi.distritoName ||
                propiedad.distrito_name === ubi.distritoName)
          );
        return matchFilters;
      });
    console.log(filteredProperties);
    console.log(selectedLocations);
    if (selectedLocations.length > 0) {
      const ubicacionesConPropiedades = selectedLocations.map((l) => {
        const cantPropiedades = filteredProperties.filter(
          (propiedad) =>
            (!l.regionName || propiedad.region_name === l.regionName) &&
            (!l.provinciaName ||
              propiedad.provincia_name === l.provinciaName) &&
            (!l.distritoName || propiedad.distrito_name === l.distritoName)
        ).length;

        return {
          ubicacion: {
            region: l.regionName,
            provincia: l.provinciaName,
            distrito: l.distritoName,
          },
          cant_propiedades: cantPropiedades,
        };
      });

      console.log(ubicacionesConPropiedades);

      setUbicacionesMapa(ubicacionesConPropiedades);
    } else {
      // Agrupar propiedades por ubicaciones únicas
      const uniqueLocations = {};

      filteredProperties.forEach((propiedad) => {
        const key = `${propiedad.region_name}-${propiedad.provincia_name}-${propiedad.distrito_name}`;
        if (!uniqueLocations[key]) {
          uniqueLocations[key] = {
            ubicacion: {
              region: propiedad.region_name,
              provincia: propiedad.provincia_name,
              distrito: propiedad.distrito_name,
            },
            cant_propiedades: 0,
          };
        }
        uniqueLocations[key].cant_propiedades += 1;
      });

      // Convertir uniqueLocations a un array
      const ubicacionesArray = Object.values(uniqueLocations);
      console.log(ubicacionesArray);

      // Actualizar el estado de ubicaciones
      setUbicacionesMapa(ubicacionesArray);
    }

    setFilterPropiedades(filteredProperties);
  };

  useEffect(() => {
    if (propiedades.length > 0) {
      applyFilters();
    }
  }, [propiedades, selectedCategories, selectedLocations, priceRange]);

  const handleCategoryChange = (value) => {
    setSelectedCategories(value);
  };

  const handleLocationChange = (value) => {
    console.log(value);
    let dataLocationes = [];
    value.map((code) => {
      propiedades.map((p) => {
        if (p.region === code) {
          let newData = {
            regionName: p.region_name,
            provinciaName: "",
            distritoName: "",
            codes: p.region,
          };
          dataLocationes.push(newData);
        }
        if (p.provincia === code) {
          let newData = {
            regionName: p.region_name,
            provinciaName: p.provincia_name,
            distritoName: "",
            codes: p.provincia,
          };
          dataLocationes.push(newData);
        }
        if (p.distrito === code) {
          let newData = {
            regionName: p.region_name,
            provinciaName: p.provincia_name,
            distritoName: p.distrito_name,
            codes: p.distrito,
          };
          dataLocationes.push(newData);
        }
      });
    });
    setSelectedLocations(dataLocationes);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const uniqueRegions = Array.from(
    new Set(propiedades.map((p) => p.region_name))
  ).map((region_name) => {
    const prop = propiedades.find((p) => p.region_name === region_name);
    return { label: region_name, val: prop.region };
  });
  console.log(uniqueRegions);
  const uniqueProvincias = [
    ...new Set(propiedades.map((p) => p.provincia_name)),
  ].map((provincia_name) => {
    const prop = propiedades.find((p) => p.provincia_name === provincia_name);
    return {
      label: provincia_name + ", " + prop.region_name,
      val: prop.provincia,
    };
  });
  const uniqueDistritos = [
    ...new Set(propiedades.map((p) => p.distrito_name)),
  ].map((distrito_name) => {
    const prop = propiedades.find((p) => p.distrito_name === distrito_name);
    return {
      label:
        distrito_name + ", " + prop.provincia_name + ", " + prop.region_name,
      val: prop.distrito,
    };
  });
  const optionsUbicaciones = uniqueRegions
    .concat(uniqueProvincias)
    .concat(uniqueDistritos);
  console.log(optionsUbicaciones);
  return (
    <div>
      <div className="filters max-w-[1200px] mx-auto px-3 pt-[90px] py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-bold text-bold-font" htmlFor="Tipos">
            Tipos
          </label>
          <Select
            mode="multiple"
            placeholder="Categorías"
            value={selectedCategories}
            onChange={handleCategoryChange}
            style={{ width: "100%" }}
          >
            <Option value={"departamento"}>departamento</Option>
            <Option value={"casa"}>casa</Option>
            <Option value={"oficina"}>oficina</Option>
            <Option value={"lote"}>lote</Option>
          </Select>
        </div>
        <div>
          <label className="text-sm font-bold text-bold-font" htmlFor="Tipos">
            Ubicaciones
          </label>
          <Select
            mode="multiple"
            placeholder="Ubicaciones"
            value={selectedLocations.map((loc) => loc.codes)}
            onChange={handleLocationChange}
            style={{ width: "100%" }}
          >
            {optionsUbicaciones.map((op, index) => (
              <Option key={index} value={op.val}>
                {op.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-bold text-bold-font" htmlFor="Tipos">
            Rango de precios
          </label>
          <Slider
            range
            min={0}
            step={100}
            max={50000} // Define un rango máximo adecuado para tus precios
            defaultValue={priceRange}
            onChange={handlePriceChange}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-3 pb-[80px]">
        <div className="w-full relative z-10">
          <MapFilter ubicaciones={ubicacionesMapa} />
        </div>
        <div className="md:h-[450px] pb-[40px] md:overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {filterPropiedades.length > 0 &&
            filterPropiedades.map((prop, index) => (
              <Link
                to={`/proyectos/${prop.id}`}
                key={index}
                className="w-full h-max overflow-hidden rounded-lg shadow relative"
              >
                <div className="absolute top-[10%] left-0 ">
                  <p
                    style={{ background: settings.color_primary }}
                    className="px-4 py-1 text-sm text-white"
                  >
                    Desde {prop.moneda === "DOLLAR" ? prop.precio_from : null}{" "}
                    {prop.moneda === "DOLLAR" ? "$" : "S/"}
                    {prop.moneda === "PEN" ? prop.precio_from : null}
                  </p>
                </div>
                <div className="h-[150px]">
                  <img
                    src={`${prop.url_file}`}
                    className="w-full h-full object-cover object-center"
                    alt=""
                  />
                </div>
                <div className="px-4 py-4 bg-white">
                  <p className="text-sm text-bold-font">
                    Proyecto - {prop.tipo}
                  </p>
                  <h1
                    style={{ color: settings.color_primary }}
                    className="font-bold text-xl"
                  >
                    {prop.nombre}
                  </h1>
                  <div className="flex gap-1">
                    <FaMapMarkerAlt className="text-bold-font text-sm" />
                    <p className="text-xs text-bold-font">
                      <span className="font-bold text-sm">
                        {prop.exactAddress}
                      </span>
                      <br />
                      {prop.region_name}
                      {", "}
                      {prop.provincia_name}
                      {", "} {prop.distrito_name}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div className="mt-4 w-full flex flex-wrap gap-3">
                      {prop.tipo !== "Lote" ? (
                        <div>
                          <FaBed className="text-bold-font text-lg" />
                          <p className="text-xs text-bold-font">{prop.habs}</p>
                        </div>
                      ) : null}
                      {prop.tipo !== "Lote" ? (
                        <div>
                          <FaBath className="text-bold-font text-lg" />
                          <p className="text-xs text-bold-font">
                            {prop.banios}
                          </p>
                        </div>
                      ) : null}
                      <div>
                        <FaVectorSquare className="text-bold-font text-lg" />
                        <p className="text-xs text-bold-font">
                          {prop.area_from} m2
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = `/proyectos/${prop.id}`;
                      }}
                      style={{ background: settings.color_secondary }}
                      className="whitespace-nowrap inline-block h-max mt-4 p-2 rounded   text-white font-bold text-xs"
                    >
                      Ver proyecto
                    </button>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
