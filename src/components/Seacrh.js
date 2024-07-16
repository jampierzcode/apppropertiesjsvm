import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapFilter from "../components/MapFilter";

const SearchPage = () => {
  const { query } = useParams();

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
      console.log(parts);
      parts.slice(1).map((ubi) => {
        ubicaciones.push(ubi);
      });
      console.log(ubicaciones);
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
      console.log(toIndex);
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
    console.log(locations);

    return { categories, locations, minPrice, maxPrice, currency };
  };

  const { categories, locations, minPrice, maxPrice, currency } =
    getPurposeAndCategories();
  const [propiedades, setPropiedades] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [filterPropiedades, setFilterPropiedades] = useState([]);
  const buscarPropiedades = async () => {
    try {
      const response = await axios.get(
        "http://localhost/apipropiedades/api/propiedades"
      );
      console.log(response);
      setPropiedades(response.data);
    } catch (error) {
      console.error("Error al obtener las propiedades:", error);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line
    buscarPropiedades();
  }, [0]);
  const [filters, setFilters] = useState({
    tipo: categories,
    precioRange: [
      minPrice === null ? 0 : minPrice,
      maxPrice === null ? Infinity : maxPrice,
    ],
    pais: "",
    ubicaciones:
      locations.length > 0
        ? locations.map((l) => ({
            region: l.regionName,
            provincia: l.provinciaName,
            distrito: l.distritoName,
          }))
        : [{ region: "", provincia: "", distrito: "" }],
  });

  // Función para aplicar el filtro

  const applyFilters = () => {
    const filteredProperties =
      propiedades.length > 0 &&
      propiedades.filter((propiedad) => {
        const matchFilters =
          (!filters.tipo.length ||
            filters.tipo.includes(propiedad.tipo.toLocaleLowerCase())) &&
          propiedad.precio_from >= filters.precioRange[0] &&
          propiedad.precio_from <= filters.precioRange[1] &&
          filters.ubicaciones.some(
            (ubi) =>
              (!ubi.region || propiedad.region_name === ubi.region) &&
              (!ubi.provincia || propiedad.provincia_name === ubi.provincia) &&
              (!ubi.distrito || propiedad.distrito_name === ubi.distrito)
          );
        return matchFilters;
      });
    console.log(locations);

    if (locations.length > 0) {
      const ubicacionesConPropiedades = locations.map((l) => {
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

      setUbicaciones(ubicacionesConPropiedades);
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

      // Actualizar el estado de ubicaciones
      setUbicaciones(ubicacionesArray);
    }

    setFilterPropiedades(filteredProperties);
  };

  // useEffect para manejar el filtrado y paginación
  useEffect(() => {
    if (propiedades.length > 0) {
      applyFilters(); // Aplicar filtro solo cuando haya propiedades
    }
  }, [propiedades]);

  return (
    <div>
      <h1>Resultados de Búsqueda</h1>
      <p>Propiedades: {categories.join(", ")}</p>
      <p>
        Ubicaciones:{" "}
        {locations
          .map(
            (location) =>
              `${location.regionName} ${
                location.provinciaName ? `, ${location.provinciaName}` : ""
              } ${location.distritoName ? `, ${location.distritoName}` : ""} ${
                location.codes ? `, ${location.codes}` : ""
              }`
          )
          .join(" | ")}
      </p>
      <p>Precio mínimo: {minPrice || "No especificado"}</p>
      <p>Precio máximo: {maxPrice || "No especificado"}</p>
      <p>Moneda: {currency || "No especificado"}</p>
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-3">
        <div className="w-full">
          <MapFilter ubicaciones={ubicaciones} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filterPropiedades.length > 0 &&
            filterPropiedades.map((prop, index) => {
              return (
                <div
                  key={index}
                  className="w-full overflow-hidden rounded-lg shadow relative"
                >
                  <div className="absolute top-[10%] left-0 ">
                    <p className="px-4 py-1 bg-dark-purple text-sm text-white">
                      Desde {prop.moneda === "DOLLAR" ? prop.precio_from : null}{" "}
                      {prop.moneda === "DOLLAR" ? "$" : "S/"}
                      {prop.moneda === "PEN" ? prop.precio_from : null}
                    </p>
                  </div>
                  <div className="h-[250px]">
                    <img
                      src={`http://localhost/apipropiedades/${prop.url_file}`}
                      className="w-full h-full object-cover object-center"
                      alt=""
                    />
                  </div>
                  <div className="px-4 py-4">
                    <h1 className="text-dark-purple font-bold text-xl">
                      {prop.nombre}
                    </h1>
                    <div className="flex gap-1">
                      <FaMapMarkerAlt className="text-bold-font" />
                      <p className="text-sm text-bold-font">
                        {prop.exactAddress}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
