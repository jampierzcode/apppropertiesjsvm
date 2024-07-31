import React, { useEffect, useState } from "react";
import PoratadaUpload from "./PortadaUpload";
import { ColorPicker, message, Space, Switch } from "antd";
import axios from "axios";

const ConfigWebSite = () => {
  const session = JSON.parse(sessionStorage.getItem("session"));
  const apiUrl = process.env.REACT_APP_API_URL;
  const [portadaFile, setPortadaFile] = useState("");
  const [initialData, setInitialData] = useState(null);
  const [webData, setWebData] = useState({
    business_id: "",
    color_primary: "",
    color_secondary: "",
    is_capa_fondo_portada: false,
    color_fondo_portada: "",
    color_capa_fondo_portada: "",
    portada: "",
  });
  const [formatHex, setFormatHex] = useState("hex");
  const handleChangeColor = (valor, etiqueta) => {
    const color = valor === "string" ? valor : valor?.toHexString();
    console.log(etiqueta);
    setWebData((prevState) => ({
      ...prevState,
      [etiqueta]: color,
    }));
  };
  const handleChangeText = (valor, etiqueta) => {
    setWebData((prevState) => ({
      ...prevState,
      [etiqueta]: valor,
    }));
  };
  const [businessData, setBusinessData] = useState([]);

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/businessbyuser/${session.id}`
      );
      const data = response.data;
      if (data.length !== 0) {
        setBusinessData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };
  const fetchWebData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/configwebbybusiness/${businessData.id}`
      );
      const data = response.data;

      if (data.length === 0) {
        setInitialData(webData);
      } else {
        const web = data[0];
        const infoData = {
          business_id: web.business_id || "",
          color_primary: web.color_primary || "",
          color_secondary: web.color_secondary || "",
          is_capa_fondo_portada:
            Number(web.is_capa_fondo_portada) === 1 ? true : false,
          color_fondo_portada: web.color_fondo_portada || "",
          color_capa_fondo_portada: web.color_capa_fondo_portada || "",
          portada: web.portada || "",
        };
        console.log(infoData);
        setWebData(infoData);
        setInitialData(infoData);
      }
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };
  useEffect(() => {
    fetchBusinessData();
  }, []); // Esta llamada inicial se ejecuta una vez al montar el componente

  useEffect(() => {
    if (businessData.id) {
      fetchWebData();
    }
  }, [businessData]);
  const handleCancel = () => {
    setWebData(initialData);
  };
  const isInitialDataEmpty = (data) => {
    return (
      data.business_id === "" &&
      data.portada === "" &&
      data.color_capa_fondo_portada === "" &&
      //   data.is_capa_fondo_portada === "" &&
      data.color_fondo_portada === "" &&
      data.color_primary === "" &&
      data.color_secondary === ""
    );
  };
  const handleSave = async () => {
    const token = session.token;
    const uploadImageUrl = `${apiUrl}/businessimg`;

    const { portada, ...webInfo } = webData;

    const uploadPortada = async (changeFile) => {
      const formData = new FormData();
      formData.append("imageWebPortada", changeFile);
      formData.append("propertyName", "portadas");
      const response = await axios.post(uploadImageUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url;
    };
    const deletePortada = async (image_url) => {
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

    const createWebData = async (newBusiness) => {
      console.log(newBusiness);
      const response = await axios.post(`${apiUrl}/configweb`, newBusiness, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    };
    const updateWebData = async (updateBusiness) => {
      const response = await axios.put(
        `${apiUrl}/configwebbybusiness`,
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
      console.log(isInitialDataEmpty(initialData));
      console.log(initialData);
      console.log(webData);
      if (isInitialDataEmpty(initialData)) {
        // New business data without logo
        if (portada) {
          console.log(portadaFile);
          const imageUrl = await uploadPortada(portadaFile);
          console.log(imageUrl);
          const response = await createWebData({
            ...webInfo,
            portada: imageUrl,
            business_id: businessData.id,
          });
          if (response.message === "add") {
            message.success("Se registro correctamente tus datos");
            setWebData((prevState) => ({
              ...prevState,
              portada: imageUrl,
              business_id: businessData.id,
            }));
            setInitialData(webData);
            setPortadaFile("");
          } else {
            message.error("No se pudo registro correctamente tus datos");
          }
        } else {
          const response = await createWebData({
            ...webInfo,
            portada: "",
            business_id: businessData.id,
          });
          if (response.message === "add") {
            message.success("Se registro correctamente tus datos");
            createWebData((prevState) => ({
              ...prevState,
              portada: "",
              business_id: businessData.id,
            }));
            setInitialData(webData);
          } else {
            message.error("No se pudo registro correctamente tus datos");
          }
        }
      } else {
        // Existing business data
        if (initialData.portada && !portada) {
          // Logo deleted
          const delete_portada = await deletePortada(initialData.portada);
          if (delete_portada.message === "remove") {
            const response = await updateWebData(webData);
            console.log(response);
            if (response.message === "update") {
              message.success("Se actualizo correctamente tus datos");
              setInitialData(webData);
            } else {
              message.error("No se actualizo correctamente tus datos");
            }
          } else {
            message.error("No se elimino la imagen correctamente");
          }
        } else if (portada && portada !== initialData.portada) {
          // Logo changed
          if (initialData.portada !== "") {
            const delete_logo = await deletePortada(initialData.portada);
            console.log(delete_logo)
          }
          const imageUrl = await uploadPortada(portadaFile);
          const response = await updateWebData({
            ...webInfo,
            portada: imageUrl,
          });
          console.log(response);
          if (response.message === "update") {
            message.success("Se actualizo correctamente tus datos");
            setInitialData(webData);
          } else {
            message.error("No se actualizo correctamente tus datos");
          }
        } else {
          // No changes in logo
          const response = await updateWebData(webData);
          console.log(response);
          if (response.message === "update") {
            message.success("Se actualizo correctamente tus datos");
            setInitialData(webData);
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
    <div className="bg-white px-5 py-5 mt-4">
      <h1 className="text-xl font-bold">Diseño de sitio web</h1>
      <div className="w-full flex gap-5">
        <div className="flex flex-col gap-3 text-sm text-black font-bold w-full ">
          <h1 className="text-sm font-bold my-4">Portada</h1>
          <div
            className="relative"
            style={{ background: webData?.colorFondoPortada }}
          >
            <img
              src={webData?.portada}
              alt=""
              className="w-full h-[200px] object-cover"
            />
            {webData.is_capa_fondo_portada ? (
              <div
                style={{ background: webData?.color_capa_fondo_portada }}
                className={`absolute top-0 left-0 right-0 bottom-0 w-full h-full`}
              ></div>
            ) : null}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 my-4">
            <div className="">
              <PoratadaUpload
                setPortadaFile={setPortadaFile}
                portada={webData.portada}
                setPortada={(portada) =>
                  setWebData((prevState) => ({
                    ...prevState,
                    portada,
                  }))
                }
              />
            </div>

            <div className="nb-4">
              <h1 className="text-sm text-black font-bold">
                Color de fondo de portada
              </h1>
              <Space>
                <ColorPicker
                  allowClear
                  format={formatHex}
                  value={webData.color_fondo_portada}
                  onChange={(e) => handleChangeColor(e, "color_fondo_portada")}
                  onFormatChange={setFormatHex}
                />
                <span>HEX: {webData.color_fondo_portada}</span>
              </Space>
            </div>
            <div>
              <h1 className="text-sm text-black font-bold">Capa de fondo</h1>
              <Switch
                value={webData.is_capa_fondo_portada}
                onChange={(e) => handleChangeText(e, "is_capa_fondo_portada")}
              />
            </div>
            <div className="nb-4">
              <h1 className="text-sm text-black font-bold">
                Color Capa de fondo
              </h1>
              <Space>
                <ColorPicker
                  allowClear
                  format={formatHex}
                  value={webData.color_capa_fondo_portada}
                  onChange={(e) =>
                    handleChangeColor(e, "color_capa_fondo_portada")
                  }
                  onFormatChange={setFormatHex}
                />
                <span>HEX: {webData.color_capa_fondo_portada}</span>
              </Space>
            </div>
          </div>
          <h1 className="text-sm font-bold my-4">Colores del sitio</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 my-4">
            <div>
              <h1 className="text-sm text-black font-bold">Color Principal</h1>
              <Space>
                <ColorPicker
                  allowClear
                  format={formatHex}
                  value={webData.color_primary}
                  onChange={(e) => handleChangeColor(e, "color_primary")}
                  onFormatChange={setFormatHex}
                />
                <span>HEX: {webData.color_primary}</span>
              </Space>
            </div>
            <div>
              <h1 className="text-sm text-black font-bold">Color Secundario</h1>
              <Space>
                <ColorPicker
                  allowClear
                  format={formatHex}
                  value={webData.color_secondary}
                  onChange={(e) => handleChangeColor(e, "color_secondary")}
                  onFormatChange={setFormatHex}
                />
                <span>HEX: {webData.color_secondary}</span>
              </Space>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end">
        <button
          disabled={JSON.stringify(webData) === JSON.stringify(initialData)}
          onClick={handleCancel}
          className={`rounded-full text-[12px] px-5 py-2   ${
            JSON.stringify(webData) === JSON.stringify(initialData)
              ? "text-gray-500 bg-gray-300"
              : "text-bold-font bg-white border-gray-300 border"
          }`}
        >
          Cancelar
        </button>
        <button
          disabled={JSON.stringify(webData) === JSON.stringify(initialData)}
          onClick={handleSave}
          className={`rounded-full text-[12px] px-5 py-2 ${
            JSON.stringify(webData) === JSON.stringify(initialData)
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

export default ConfigWebSite;
