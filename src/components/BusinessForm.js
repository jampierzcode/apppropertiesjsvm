import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoUpload from "./LogoUpload";
import InputField from "./InputField";
import { message } from "antd";

const BusinessForm = () => {
  // estados funcionales

  const session = JSON.parse(sessionStorage.getItem("session"));
  const apiUrl = process.env.REACT_APP_API_URL;
  const [businessData, setBusinessData] = useState({
    user_id: "",
    logo: "",
    nombre_razon: "",
    website: "",
    direccion: "",
    phone_contact: "",
    email: "",
  });
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchBusinessData();
  }, [0]);

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/businessbyuser/${session.id}`
      );
      const data = response.data;

      if (data.length === 0) {
        setInitialData(businessData);
      } else {
        const business = data[0];
        const infoBusiness = {
          logo: business.logo || "",
          user_id: business.user_id || "",
          nombre_razon: business.nombre_razon || "",
          website: business.website || "",
          direccion: business.direccion || "",
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

  const handleCancel = () => {
    setBusinessData(initialData);
  };

  const isInitialDataEmpty = (data) => {
    return (
      data.user_id === "" &&
      data.logo === "" &&
      data.nombre_razon === "" &&
      data.website === "" &&
      data.phone_contact === "" &&
      data.email === ""
    );
  };
  const [logoFile, setLogoFile] = useState("");
  const handleSave = async () => {
    const token = session.token;
    const uploadImageUrl = `${apiUrl}/businessimg`;

    const { logo, ...businessInfo } = businessData;

    const uploadLogo = async (changeFile) => {
      const formData = new FormData();
      formData.append("imageBusiness", changeFile);
      formData.append("propertyName", "logos");
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

    const createBusinessData = async (newBusiness) => {
      console.log(newBusiness);
      const response = await axios.post(`${apiUrl}/business`, newBusiness, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    };
    const updateBusinessData = async (updateBusiness) => {
      const response = await axios.put(
        `${apiUrl}/busineesbyuser`,
        updateBusiness,
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
      if (isInitialDataEmpty(initialData)) {
        // New business data without logo
        if (logo) {
          const imageUrl = await uploadLogo(logoFile);
          console.log(imageUrl);
          const response = await createBusinessData({
            ...businessInfo,
            logo: imageUrl,
            user_id: session.id,
          });
          if (response.message === "add") {
            message.success("Se registro correctamente tus datos");
            setBusinessData((prevState) => ({
              ...prevState,
              logo: imageUrl,
              user_id: session.id,
            }));
            setInitialData(businessData);
            setLogoFile("");
          } else {
            message.error("No se pudo registro correctamente tus datos");
          }
        } else {
          const response = await createBusinessData({
            ...businessInfo,
            logo: "",
            user_id: session.id,
          });
          if (response.message === "add") {
            message.success("Se registro correctamente tus datos");
            createBusinessData((prevState) => ({
              ...prevState,
              logo: "",
              user_id: session.id,
            }));
            setInitialData(businessData);
          } else {
            message.error("No se pudo registro correctamente tus datos");
          }
        }
      } else {
        // Existing business data
        if (initialData.logo && !logo) {
          // Logo deleted
          const delete_logo = await deleteLogo(initialData.logo);
          if (delete_logo.message === "remove") {
            const response = await updateBusinessData(businessData);
            console.log(response);
            if (response.message === "update") {
              message.success("Se actualizo correctamente tus datos");
              setInitialData(businessData);
            } else {
              message.error("No se actualizo correctamente tus datos");
            }
          } else {
            message.error("No se elimino la imagen correctamente");
          }
        } else if (logo && logo !== initialData.logo) {
          // Logo changed
          if (initialData.logo !== "") {
            const delete_logo = await deleteLogo(initialData.logo);
            console.log(delete_logo)
          }
          const imageUrl = await uploadLogo(logoFile);
          const response = await updateBusinessData({
            ...businessInfo,
            logo: imageUrl,
          });
          console.log(response);
          if (response.message === "update") {
            message.success("Se actualizo correctamente tus datos");
            setInitialData(businessData);
          } else {
            message.error("No se actualizo correctamente tus datos");
          }
        } else {
          // No changes in logo
          const response = await updateBusinessData(businessData);
          console.log(response);
          if (response.message === "update") {
            message.success("Se actualizo correctamente tus datos");
            setInitialData(businessData);
          } else {
            message.error("No se actualizo correctamente tus datos");
          }
        }
      }
    } catch (error) {
      console.error("Error saving business data", error);
      message.error("Failed to save business information");
    }
  };

  return (
    <div className="bg-white px-5 py-5">
      <div className="w-full flex gap-5">
        <div className="flex flex-col gap-3 text-sm text-black font-bold">
          <label htmlFor="img">Logo Business</label>
          <LogoUpload
            setLogoFile={setLogoFile}
            logo={businessData.logo}
            setLogo={(logo) =>
              setBusinessData((prevState) => ({
                ...prevState,
                logo,
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
        id="direccion"
        label="Direccion"
        value={businessData.direccion}
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
