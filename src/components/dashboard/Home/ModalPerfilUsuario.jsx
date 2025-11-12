import React, { useState, useEffect } from "react";
import "./ModalPerfilUsuario.css";
import { seguirUsuario } from "../../../api/usuarios/seguirUsuario";
import { dejarDeSeguirUsuario } from "../../../api/usuarios/dejarDeSeguirUsuario";
import { obtenerSeguidores } from "../../../api/usuarios/obtenerSeguidores";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";

const ModalPerfilUsuario = ({ usuarioASeguir, onClose }) => {
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(0);

  const seguidorId = parseInt(localStorage.getItem("userId"), 10);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarSeguidores = async () => {
      if (usuarioASeguir?.id) {
        const listaSeguidores = await obtenerSeguidores(usuarioASeguir.id);
        setSeguidores(listaSeguidores.length);

        // Verificar si el usuario logueado está en la lista
        const yaSigo = listaSeguidores.some((seguidor) => seguidor.id === seguidorId);
        setSiguiendo(yaSigo);
      }
    };

    cargarSeguidores();
  }, [usuarioASeguir, seguidorId]);

  if (!usuarioASeguir) return null;
  if (!seguidorId || !token) {
    console.error("No hay usuario autenticado o token");
    return null;
  }

  const usuarioASeguirId = usuarioASeguir.id;

  const manejarClickSeguir = async () => {
    if (siguiendo) {
      await dejarDeSeguirUsuario(seguidorId, usuarioASeguirId, token, setSiguiendo);
    } else {
      await seguirUsuario(seguidorId, usuarioASeguirId, token, setSiguiendo);
    }

    // Actualizar los seguidores
    const listaSeguidores = await obtenerSeguidores(usuarioASeguirId);
    setSeguidores(listaSeguidores.length);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <img src={getAvatarUrl(usuarioASeguir.avatar)} className="modal-avatar" alt="avatar" />
        <h2>{usuarioASeguir.username}</h2>
        <p>{usuarioASeguir.perfil}</p>
        <p>Seguidores: {seguidores} </p>

        {seguidorId !== usuarioASeguir.id && (
          <button
            className={`follow-button ${siguiendo ? "siguiendo" : ""}`}
            onClick={manejarClickSeguir}
          >
            {siguiendo ? "Siguiendo" : "Seguir"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalPerfilUsuario;
