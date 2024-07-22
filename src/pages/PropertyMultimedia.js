import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useParams } from "react-router-dom";

const PropertyMultimedia = () => {
  //useparams
  const { propertyId } = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  const session = JSON.parse(sessionStorage.getItem("session"));
  // ESTADOS DE DATOS BASICOS propiedad multimedia
  const [multimedia, setMultimedia] = useState([]);
  const [initialMultimedia, setInitialMultimedia] = useState([]);
  useEffect(() => {
    const fetchMultimediaProperty = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/multimediabypropiedad/${propertyId}`,
          {}
        );
        console.log(response.data);
        setMultimedia(response.data);
        setInitialMultimedia(response.data);
      } catch (error) {
        console.error("Error al obtener las amenidades del proyecto:", error);
      }
    };
    fetchMultimediaProperty();
  }, [apiUrl, propertyId]);

  const [addNewMultimedia, setAddNewMultimedia] = useState([]);
  const [removeMultimedia, setRemoveMultimedia] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  useEffect(() => {
    if (initialMultimedia.length > 0) {
      // Set the cover image and gallery images from the initial data
      const cover = initialMultimedia.find(
        (item) => item.etiqueta === "Portada"
      );
      const gallery = initialMultimedia.filter(
        (item) => item.etiqueta === "Galeria"
      );
      console.log(cover);
      console.log(gallery);
      setCoverImage(cover);
      setGalleryImages(gallery);
    }
  }, [initialMultimedia]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newCoverImage = {
        file,
        url_file: url,
        etiqueta: "Portada",
        categoria: "Fotos",
        propiedad_id: propertyId,
        id: "no",
      };
      if (
        coverImage &&
        initialMultimedia.some((img) => img.url_file === coverImage.url_file)
      ) {
        setRemoveMultimedia([...removeMultimedia, coverImage]);
      } else {
        console.log("entro a eliminarr de adds");
        setAddNewMultimedia((prev) =>
          prev.filter((item) => item.etiqueta !== "Portada")
        );
      }
      setCoverImage(newCoverImage);
      if (
        !initialMultimedia.some(
          (img) => img.url_file === newCoverImage.url_file
        )
      ) {
        setAddNewMultimedia((prev) => [...prev, newCoverImage]);
      }
    }
  };
  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url_file: URL.createObjectURL(file),
      categoria: "Fotos",
      propiedad_id: propertyId,
      etiqueta: "Galeria",
      id: "no",
    }));
    setGalleryImages((prev) => {
      const updatedGallery = [...prev, ...newImages];
      // Update addNewMultimedia state
      const newAdditions = [];
      newImages.forEach((newImage) => {
        if (
          !initialMultimedia.some((img) => img.url_file === newImage.url_file)
        ) {
          newAdditions.push(newImage);
        }
      });
      setAddNewMultimedia((prev) => [...prev, ...newAdditions]);
      return updatedGallery;
    });
  };

  const handleRemoveCoverImage = () => {
    if (
      coverImage &&
      initialMultimedia.some((img) => img.url_file === coverImage.url_file)
    ) {
      setRemoveMultimedia([...removeMultimedia, coverImage]);
    } else {
      setAddNewMultimedia((prev) =>
        prev.filter((item) => item.etiqueta !== "Portada")
      );
    }
    setCoverImage(null);
  };

  const handleRemoveGalleryImage = (index) => {
    const imageToRemove = galleryImages[index];
    if (
      initialMultimedia.some((img) => img.url_file === imageToRemove.url_file)
    ) {
      setRemoveMultimedia([...removeMultimedia, imageToRemove]);
    } else {
      setAddNewMultimedia((prev) =>
        prev.filter((item) => item.url_file !== imageToRemove.url_file)
      );
    }
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setDropIndex(null);
  };

  const handleDragEnter = (index) => {
    setDropIndex(index);
  };

  const handleDragLeave = () => {
    setDropIndex(null);
  };
  const [changedMultimedia, setChangedMultimedia] = useState([]);

  const handleDrop = () => {
    if (draggedIndex === null || dropIndex === null) return;

    const newGalleryImages = [...galleryImages]; // Copia del array

    let draggedImage;

    if (draggedIndex === -1) {
      // Si la imagen arrastrada es la imagen de portada
      draggedImage = { ...coverImage }; // Copia del objeto
      if (dropIndex === -1) {
        return;
      } else {
        const droppedImage = { ...newGalleryImages[dropIndex] }; // Copia del objeto
        droppedImage.etiqueta = "Portada";
        draggedImage.etiqueta = "Galeria";
        newGalleryImages[dropIndex] = draggedImage;
        setCoverImage(droppedImage);

        setMultimedia([droppedImage, ...newGalleryImages]);
      }
    } else {
      draggedImage = { ...newGalleryImages.splice(draggedIndex, 1)[0] }; // Copia del objeto
      if (dropIndex === -1) {
        draggedImage.etiqueta = "Portada";
        const currentCoverImage = { ...coverImage }; // Copia del objeto
        currentCoverImage.etiqueta = "Galeria";
        setCoverImage(draggedImage);
        if (currentCoverImage) {
          newGalleryImages.splice(draggedIndex, 0, currentCoverImage);
        }
      } else {
        newGalleryImages.splice(dropIndex, 0, draggedImage);
      }
      setMultimedia([draggedImage, ...newGalleryImages]);
    }

    setGalleryImages(newGalleryImages);
    setDraggedIndex(null);
    setDropIndex(null);
  };
  console.log(initialMultimedia);
  console.log(multimedia);
  //   useEffect(() => {
  //     if (coverImage !== null && galleryImages.length > 0) {
  //       setMultimedia([coverImage, ...galleryImages]);
  //     }
  //   }, [coverImage, galleryImages]);

  const sendCoverPropiedad = async (nombrePropiedad) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();
      const propertyName = nombrePropiedad; // Asume que este valor lo obtienes de algún input o estado

      formData.append("propertyName", propertyName);
      if (coverImage) {
        formData.append("coverImage", coverImage.file);
      }

      try {
        const response = await axios.post(`${apiUrl}/uploadimg`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const sendGalleryPropiedad = async (nombrePropiedad) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;
      const formData = new FormData();
      const propertyName = nombrePropiedad; // Asume que este valor lo obtienes de algún input o estado

      formData.append("propertyName", propertyName);

      galleryImages.forEach((img, index) => {
        formData.append(`galleryImages[${index}]`, img.file);
      });

      try {
        const response = await axios.post(`${apiUrl}/uploadimg`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const createMultimediaPropiedad = async (newMultimedia) => {
    return new Promise(async (resolve, reject) => {
      const token = session.token;

      try {
        const response = await axios.post(
          `${apiUrl}/multimediapropiedades`,
          newMultimedia,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        resolve(data);
      } catch (error) {
        reject(error);
        console.error("Upload error:", error);
      }
    });
  };
  const compareStates = (state1, state2) => {
    return JSON.stringify(state1) === JSON.stringify(state2);
  };
  const verificarCambios = () => {
    const areMultimediaChange = compareStates(multimedia, initialMultimedia);
    const areAddMultimedia = addNewMultimedia.length > 0 ? false : true;
    const areRemoveMultimedia = removeMultimedia.length > 0 ? false : true;

    if (!areMultimediaChange || !areAddMultimedia || !areRemoveMultimedia) {
      return false;
    } else {
      return true;
    }
  };
  const handleCancel = () => {
    console.log(initialMultimedia);
    setMultimedia(initialMultimedia);
    setAddNewMultimedia([]);
    setRemoveMultimedia([]);
  };
  const handleSave = async () => {
    console.log("save");
  };
  return (
    <div className="w-full p-6 app-container-sections">
      <div className="boxPropie mb-6">
        <h1 className="text-md font-medium text-bold-font">Multimedia</h1>

        {/* Cover Image Section */}
        <div className="mt-[24px] mb-[16px]">
          <div className="text-sm text-bold-font font-medium">
            Imagen de portada
          </div>
        </div>
        <div data-position="-1">
          {coverImage && (
            <div
              className={`propie-upload-thumbnail draggable ${
                dropIndex === -1 ? "dropArea" : ""
              }`}
              style={{ backgroundImage: `url("${coverImage.url_file}")` }}
              draggable="true"
              onDragStart={() => handleDragStart(-1)}
              onDragEnter={() => handleDragEnter(-1)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="remove" onClick={handleRemoveCoverImage}>
                <FaTimes />
              </div>
            </div>
          )}
          <div className="inmocms-upload-gallery">
            <button
              className="bg-white text-sm font-medium border-dark-purple border rounded text-dark-purple px-3 py-2"
              onClick={() => document.getElementById("coverInput").click()}
            >
              Subir foto
            </button>
            <input
              id="coverInput"
              className="hidden"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/bmp, image/webp, image/gif, image/x-icon"
              onChange={handleCoverImageChange}
            />
          </div>
          <div className="text-sm text-light-font mt-[16px] mb-[16px]">
            (Tamaño máximo <b>50 Mb</b> por archivo)
          </div>
        </div>

        {/* Gallery Images Section */}
        <div className="mt-[24px] mb-[16px]">
          <div className="text-sm text-bold-font font-medium">
            Galería de imágenes
          </div>
        </div>
        <div className="propie-upload-gallery">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              data-position={index}
              draggable="true"
              className={`propie-upload-thumbnail draggable ${
                dropIndex === index ? "dropArea" : ""
              }`}
              style={{ backgroundImage: `url("${img.url_file}")` }}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div
                className="remove"
                onClick={() => handleRemoveGalleryImage(index)}
              >
                <FaTimes />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-start">
          <button
            className="bg-white text-sm font-medium border-dark-purple border rounded text-dark-purple px-3 py-2"
            onClick={() => document.getElementById("galleryInput").click()}
          >
            Subir fotos
          </button>
          <input
            id="galleryInput"
            className="hidden"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/bmp, image/webp, image/gif, image/x-icon"
            multiple
            onChange={handleGalleryImagesChange}
          />
        </div>
        <div className="text-sm text-light-font mt-[16px] mb-[16px]">
          (Tamaño máximo <b>50 Mb</b> por archivo)
        </div>
      </div>
      <div className="w-full flex justify-between px-3 bottom-[-31px] py-6 sticky z-50 bg-white shadow-md">
        <span className="text-sm text-bold-font font-mdium">
          * Campos requeridos
        </span>
        <div className="flex items-center gap-4 justify-end">
          <button
            disabled={verificarCambios()}
            onClick={handleCancel}
            className={`rounded-full text-[12px] px-5 py-2   ${
              verificarCambios()
                ? "text-gray-500 bg-gray-300"
                : "text-bold-font bg-white border-gray-300 border"
            }`}
          >
            Cancelar
          </button>
          <button
            disabled={verificarCambios()}
            onClick={handleSave}
            className={`rounded-full text-[12px] px-5 py-2 ${
              verificarCambios()
                ? "text-gray-500 bg-gray-300"
                : "text-white bg-dark-purple"
            } `}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyMultimedia;
