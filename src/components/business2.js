import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoUpload from "./LogoUpload";
import InputField from "./InputField";

const BusinessForm = () => {
  const session = JSON.parse(sessionStorage.getItem("session"));
  const [businessData, setBusinessData] = useState({
    logo: "",
    user_id: "",
    nombre_razon: "",
    website: "",
    phone_contact: "",
    email: "",
  });
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(
        "http://localhost/apipropiedades/api/business"
      );
      console.log(response);
      const data = response.data;
      console.log(data);
      if (data === "") {
        setInitialData(businessData);
      } else {
        const business = JSON.parse(data)[0];
        const infoBusiness = {
          logo: business.logo || "",
          user_id: business.user_id || "",
          nombre_razon: business.nombre_razon || "",
          website: business.website || "",
          phone_contact: business.phone_contact || "",
          email: business.email || "",
        };
        setBusinessData(infoBusiness);
        setInitialData(infoBusiness);
      }
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setBusinessData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  console.log(businessData);
  console.log(initialData);

  const handleCancel = () => {
    setBusinessData(initialData);
  };
  const isInitialDataEmpty = (data) => {
    return (
      !data.logo &&
      !data.user_id &&
      !data.nombre_razon &&
      !data.website &&
      !data.phone_contact &&
      !data.email
    );
  };
  const handleSave = async () => {
    const apiBaseUrl = "http://localhost/apipropiedades/api";
    const uploadImageUrl = `${apiBaseUrl}/businessimg`;
    const updateBusinessUrl = `${apiBaseUrl}/business`;

    const uploadLogo = async (logo) => {
      const token = session.token;
      const formData = new FormData();
      formData.append("imageBusiness", logo.file);
      formData.append("propertyName", "logos");
      const response = await axios.post(uploadImageUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data.logoBusiness;
    };
    const deleteLogo = async (imageUrl) => {
      const token = session.token;
      const response = await axios.delete(
        "http://localhost/apipropiedades/api/businessimg",
        {
          data: { imageUrl: imageUrl },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      return response.data;
    };
    const updateLogo = async (imageUrl, logo) => {
      const token = session.token;
      const formData = new FormData();
      formData.append("route", imageUrl);
      formData.append("businessimagenupdate", logo.file);

      const response = await axios.post(uploadImageUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    };

    const updateBusinessData = async (data, method = "POST") => {
      console.log(data);
      await axios({
        method,
        url: updateBusinessUrl,
        data,
      });
    };

    try {
      if (isInitialDataEmpty(initialData)) {
        // New business data without logo
        if (logo) {
          let imageUrl = "";
          if (initialData.logo !== businessData.logo) {
            if (initialData.logo === "") {
              imageUrl = await uploadLogo(logo);
            } else {
              if (businessData.logo === "") {
                let eliminar_imagen = await deleteLogo(initialData.logo);
              } else {
                imageUrl = await updateLogo(initialData.logo, logo);
              }
            }
          }
          console.log(imageUrl);
          setBusinessData({ ...businessData, logo: imageUrl });
          await updateBusinessData(businessData);
        } else {
          await updateBusinessData(businessData);
        }
      }
    } catch (error) {
      console.error("Error saving business data", error);
      alert("Failed to save business information");
    }
  };

  return (
    <div className="bg-white px-5 py-5">
      <div className="w-full flex gap-5">
        <div className="flex flex-col gap-3 text-sm text-black font-bold">
          <label htmlFor="img">Logo Business</label>
          <LogoUpload
            logo={businessData.logo}
            setLogo={(logo) =>
              setBusinessData((prevState) => ({
                ...prevState,
                logo: logo.name,
              }))
            }
          />
        </div>
      </div>
      <InputField
        id="nombre_razon"
        label="Nombre o razón social"
        value={businessData.nombre_razon}
        onChange={handleChange}
      />
      <InputField
        id="email"
        label="Correo electrónico"
        value={businessData.email}
        onChange={handleChange}
      />
      <InputField
        id="phone_contact"
        label="Número de contacto"
        value={businessData.phone_contact}
        onChange={handleChange}
      />
      <InputField
        id="website"
        label="Sitio web"
        value={businessData.website}
        onChange={handleChange}
      />
      <div className="flex items-center gap-4 justify-end">
        <button
          disabled={
            JSON.stringify(businessData) === JSON.stringify(initialData)
          }
          onClick={handleCancel}
          className={`rounded-full text-[12px] px-5 py-2   ${
            JSON.stringify(businessData) === JSON.stringify(initialData)
              ? "text-gray-500 bg-gray-300"
              : "text-bold-font bg-white border-gray-300 border"
          }`}
        >
          Cancelar
        </button>
        <button
          disabled={
            JSON.stringify(businessData) === JSON.stringify(initialData)
          }
          onClick={handleSave}
          className={`rounded-full text-[12px] px-5 py-2 ${
            JSON.stringify(businessData) === JSON.stringify(initialData)
              ? "text-gray-500 bg-gray-300"
              : "text-white bg-dark-purple"
          } `}
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default BusinessForm;
