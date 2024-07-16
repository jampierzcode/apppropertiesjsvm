import React from "react";
import { FaTimes } from "react-icons/fa";

const PoratadaUpload = ({ portada, setPortada, setPortadaFile }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setPortada(url);
    setPortadaFile(file);
  };

  const handleDelete = () => {
    setPortada("");
  };

  return (
    <div id="content-perfil">
      <div id="img-profile" className="w-[80px] relative">
        <input
          id="portada_upload"
          className="hidden"
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif"
          onChange={handleFileChange}
        />
        {portada ? (
          <>
            <img
              className="w-[80px] h-[80px] object-cover p-1 rounded-full"
              src={portada}
              alt="Profile"
            />
            <span
              id="delete_perfil_photo"
              className="inline-block translate-x-[50%] translate-y-[-50%] rounded-full w-[30px] h-[30px] p-2 absolute top-[0] right-[0] shadow-lg z-[5000] bg-white cursor-pointer"
              onClick={handleDelete}
            >
              <FaTimes />
            </span>
          </>
        ) : (
          <div
            id="perfil_overlay"
            className="w-[90px] h-[90px] p-1 rounded-full ring-2 ring-gray-200 dark:ring-gray-500 flex items-center flex-col bg-gray-100 text-gray-400 gap-2 justify-center cursor-pointer"
            onClick={() => document.getElementById("portada_upload").click()}
          >
            <ion-icon
              className="text-[25px]"
              name="business-outline"
            ></ion-icon>
            <p className="text-[8px] w-[70%] text-center">
              Selecciona la portada del sitio de Inicio
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoratadaUpload;
