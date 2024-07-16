import React from "react";
import { FaBath, FaBed, FaMapMarkerAlt, FaVectorSquare } from "react-icons/fa";
import { Link } from "react-router-dom";

const ListPropiedadesPage = ({ settings, propiedades }) => {
  console.log(settings);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {propiedades.map((prop, index) => {
        return (
          <Link
            to={`/proyectos/${prop.id}`}
            key={index}
            className="w-full overflow-hidden rounded-lg shadow relative"
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
            <div className="h-[150px] md:h-[200px]">
              <img
                src={`${prop.url_file}`}
                className="w-full h-full object-cover object-center"
                alt=""
              />
            </div>
            <div className="px-4 py-4 bg-white">
              <p className="text-sm text-bold-font">{prop.tipo}</p>
              <h1
                style={{ color: settings.color_primary }}
                className="font-bold text-xl"
              >
                {prop.nombre}
              </h1>
              <div className="flex gap-1">
                <FaMapMarkerAlt className="text-bold-font" />
                <p className="text-xs text-bold-font">
                  {prop.region_name}
                  {">"}
                  {prop.provincia_name}
                  {">"} {prop.distrito_name}
                  {">"} <br />
                  {prop.exactAddress}
                </p>
              </div>
              <div className="mt-4 w-full flex flex-wrap gap-3">
                {prop.tipo !== "Lote" ? (
                  <div>
                    <FaBed className="text-bold-font text-lg" />
                    <p className="text-sm text-bold-font">
                      Habitaciones: {prop.habs}
                    </p>
                  </div>
                ) : null}
                {prop.tipo !== "Lote" ? (
                  <div>
                    <FaBath className="text-bold-font text-lg" />
                    <p className="text-sm text-bold-font">
                      Baños: {prop.banios}
                    </p>
                  </div>
                ) : null}
                <div>
                  <FaVectorSquare className="text-bold-font text-lg" />
                  <p className="text-sm text-bold-font">
                    Area: {prop.area_from} m2
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ListPropiedadesPage;
