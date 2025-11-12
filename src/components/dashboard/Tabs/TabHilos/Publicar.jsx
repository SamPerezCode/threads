import React, { useEffect, useState } from "react";
import "./Publicar.css";
import ModalHilo from "./ModalHilo";
import { obtenerPerfil } from "../../../../api/perfil/obtenerPerfil";
import { getAvatarUrl } from "../../../../utils/getAvatarUrl";

const Publicar = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const cargarAvatar = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const perfil = await obtenerPerfil(userId);

        setAvatar(getAvatarUrl(perfil?.avatar));
      } catch (error) {
        console.error("❌ Error al cargar el avatar en Publicar:", error);
        setAvatar("/default-avatar.png");
      }
    };

    cargarAvatar();
  }, []);

  return (
    <>
      <div className="publicar-container">
        <div className="publicar-header">
          <img src={getAvatarUrl(avatar)} alt="Avatar" className="avatar-publicar" />
          <input
            type="text"
            placeholder="¿Qué hay de nuevo?"
            className="input-publicar"
            onClick={() => setModalAbierto(true)}
            readOnly
          />
          <button className="publicar">Publicar</button>
        </div>
      </div>

      {modalAbierto && <ModalHilo avatar={avatar} onClose={() => setModalAbierto(false)} />}
    </>
  );
};

export default Publicar;
