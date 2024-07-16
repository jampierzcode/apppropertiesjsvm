import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const amenitiesList = [
  "Agua",
  "Luz",
  "Desagüe",
  "Habilitacion urbana",
  "Pistas asfaltadas",
  "Pistas afirmadas",
  "Veredas",
  "Título independiente",
  "Acciones y derechos",
  "Sin cargas ni gravamenes",
  "Cerco perimétrico",
  "Construcción provicional",
  "Precio Negociable",
  "Rutas de transporte público",
  "Acumuladores calor",
  "Adaptación movilidad reducida",
  "Adaptado minusvalido",
  "Aire acondicionado",
  "Aire central",
  "Alarma",
  "Alarma antirobo",
  "Alarma incendio",
  "Arboles",
  "Armario empotrado",
  "Armarios empotrados",
  "Ascensor",
  "Barbacoa",
  "Bodega",
  "Bomba frio calor",
  "Buhardilla",
  "C/i gas",
  "C/i propano",
  "Caja fuerte",
  "Calefacción",
  "Calefacción central",
  "Calefacción eléctrica",
  "Calefacción gasoil",
  "Camarote",
  "Cancha de baloncesto",
  "Centros comerciales",
  "Chimenea",
  "Colegios",
  "Conserje",
  "Costa",
  "Deposito de agua",
  "Descalcificador",
  "Despensa",
  "Diafano",
  "Doble ventana",
  "Domótica",
  "Energía solar",
  "Entidad bancaria",
  "Exclusiva",
  "Exterior",
  "Galería",
  "Garaje doble",
  "Gas butano",
  "Gas ciudad",
  "Gimnasio",
  "Golf",
  "Habitacion de juegos",
  "Hidromasaje",
  "Hilo musical",
  "Hospitales",
  "Interior",
  "Jacuzzi",
  "Jardín",
  "Lavanderia",
  "Linea teléfono",
  "Metro",
  "Mirador",
  "Montaña",
  "Obra nueva",
  "Opc. compra",
  "Parabólica",
  "Parada autobus",
  "Patio",
  "Pergola",
  "Piscina",
  "Piscina cubierta",
  "Piscina de comunidad",
  "Piscina propia",
  "Pista de fútbol",
  "Pista de pádel",
  "Pista de tenis",
  "Primera linea",
  "Puerta blindada",
  "Reformado",
  "Rural",
  "Sauna",
  "Solarium",
  "Soleado",
  "Sotano",
  "Spa",
  "Tendedero",
  "Toma de gas",
  "Tranvia",
  "Trastero",
  "Tren",
  "Tutelado",
  "Txoko",
  "Urbanización",
  "V.p.o.",
  "Vallado",
  "Vestidor",
  "Video portero",
  "Vigilancia",
  "Vistas",
  "Vistas al mar",
  "Zonas infantiles",
  "Área de juegos para niños",
  "Areas verdes",
  "Boulevard peatonal",
  "Gimnasio",
  "Jardín interior",
  "Lobby",
  "Piscina",
  "Sala Bar",
  "Sala de cine",
  "Sala de Niños",
  "Sala de usos Múltiples",
  "Terraza",
  "Video vigilancia",
  "Zona de Lavandería",
  "Zona de Parrillas",
  "Club House",
  "Parque para perros",
  "Zona de meditacion",
  "boulevard",
];

const Amenities = ({ selectedAmenities, setSelectedAmenities }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const handleChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(
        selectedAmenities.filter((item) => item !== amenity)
      );
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const filteredAmenities = amenitiesList.filter((amenity) =>
    amenity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="boxPropie mb-6">
      <h3 className="text-md font-medium text-bold-font mb-4">Amenidades</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-full gap-3 mb-4">
        <div className="w-full">
          <span className="text-xs mb-3 font-medium text-bold-font">
            Buscar{" "}
          </span>

          <div className="flex justify-between items-center w-full px-3 py-2 rounded border-2 border-gray-200">
            <input
              className="bg-transparent"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm ? (
              <div
                onClick={clearSearch}
                className="p-2 rounded-full shadow-sm cursor-pointer"
              >
                <FaTimes className="icon text-light-font" />
              </div>
            ) : (
              <FaSearch className="icon text-light-font text-center" />
            )}
          </div>
        </div>
      </div>
      <div className="amenities-list grid  grid-cols-1 md:grid-cols-3 gap-3">
        {filteredAmenities.map((amenity, index) => (
          <div key={index} className="amenity-item">
            <input
              className="mr-3"
              type="checkbox"
              id={`amenity-${index}`}
              name={amenity}
              value={amenity}
              checked={selectedAmenities.includes(amenity)}
              onChange={() => handleChange(amenity)}
            />
            <label
              className="text-sm font-medium text-bold-font"
              htmlFor={`amenity-${index}`}
            >
              {amenity}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Amenities;
