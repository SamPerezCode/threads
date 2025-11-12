// src/components/Tabs/TabHilos/ModalHilo.jsx
import React, { useState, useEffect } from "react";
import "./ModalHilo.css";
import VerticalLine from "../../../icons/VerticalLine";
import ModalHeader from "./CompModalHilo/ModalHeader";
import HiloItem from "./CompModalHilo/HiloItem";
import AñadirHiloFooter from "./CompModalHilo/AñadirHiloFooter";
import ModalFooter from "./CompModalHilo/ModalFooter";
import { responderComentario } from "../../../../api/publicaciones/responderComentario";
import { obtenerPerfil } from "../../../../api/perfil/obtenerPerfil";
import { crearComentario } from "../../../../api//publicaciones/crearComentario,js";
import { getAvatarUrl } from "../../../../utils/getAvatarUrl";
import "../../../../components/dashboard/Home/ModalRespuesta.css";

const ModalHilo = ({ onClose, comentarioIdPadre = null, comentarioOriginal = null }) => {
  const [hilos, setHilos] = useState([{ id: Date.now(), texto: "", imagen: null }]);
  const [avatar, setAvatar] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const perfil = await obtenerPerfil(userId);

        setAvatar(getAvatarUrl(perfil?.avatar));

        setUsuarioId(perfil.id);
      } catch (err) {
        console.error("❌ Error al cargar perfil en ModalHilo:", err);
        setAvatar("/default-avatar.png");
      }
    };

    cargarPerfil();
  }, []);

  const handlePublicar = async () => {
    const primerHilo = hilos[0];
    const texto = primerHilo.texto.trim();
    const imagen = primerHilo.imagen;

    if ((!texto && !imagen) || !usuarioId) return;

    let contenido = texto;

    if (imagen) {
      contenido += `<br><img src="${imagen}" alt="imagen adjunta" style="max-width: 100%"/>`;
    }

    try {
      console.log("Enviando contenido:", contenido);

      const token = localStorage.getItem("token");

      if (comentarioIdPadre) {
        // Modo respuesta
        await responderComentario({
          usuario_id: usuarioId,
          comentario_padre_id: comentarioIdPadre,
          contenido,
          token,
        });
      } else {
        // Modo comentario principal
        await crearComentario(usuarioId, contenido, null);
      }

      setHilos([{ id: Date.now(), texto: "", imagen: null }]);
      onClose();
    } catch (err) {
      console.error("❌ Error al publicar:", err);
      alert("Hubo un error al publicar tu comentario.");
    }
  };
  const actualizarHilo = (index, campo, valor) => {
    const nuevosHilos = [...hilos];
    nuevosHilos[index][campo] = valor;
    setHilos(nuevosHilos);
  };

  return (
    <div className="modal-hilo">
      <div className="modal-contenido">
        <ModalHeader onClose={onClose} esRespuesta={!!comentarioIdPadre} />

        <div className="scroll-contenido">
          {comentarioOriginal && (
            <div className="comentario-original">
              <div className="container-avatar">
                <img
                  src={getAvatarUrl(comentarioOriginal.usuario?.avatar)}
                  alt="avatar"
                  className="avatar-modal-respuesta"
                />
                <VerticalLine className="vertical-line-dinamica" />
              </div>
              <div className="contenido-comentario">
                <div className="username">{comentarioOriginal.usuario?.username}</div>
                <div
                  className="texto-Modal-respuesta"
                  dangerouslySetInnerHTML={{ __html: comentarioOriginal.texto }}
                />
              </div>
            </div>
          )}

          {hilos.map((hilo, index) => (
            <HiloItem
              key={hilo.id}
              index={index}
              hilo={hilo}
              hilos={hilos}
              setHilos={setHilos}
              avatar={avatar}
              actualizarHilo={actualizarHilo}
              eliminarUltimoHilo={() => {
                if (hilos.length > 1) {
                  setHilos((prev) => prev.slice(0, -1));
                }
              }}
            />
          ))}
        </div>

        <AñadirHiloFooter
          avatar={avatar}
          puedeAñadir={hilos[0].texto.trim() !== "" || hilos[0].imagen}
          onAñadir={() =>
            setHilos((prev) => [
              ...prev,
              { id: Date.now(), texto: "", imagen: null, ubicacion: null },
            ])
          }
        />

        <ModalFooter onPublicar={handlePublicar} />
      </div>
    </div>
  );
};

export default ModalHilo;
