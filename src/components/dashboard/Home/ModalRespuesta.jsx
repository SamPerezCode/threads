import React, { useEffect, useState } from "react";
import "./ModalRespuesta.css";
import ModalHilo from "../Tabs/TabHilos/ModalHilo";
import CommentIcon from "../../icons/CommentIcon";
import obtenerUsuario from "../../../api/usuarios/ObtenerInformacionUsuario";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";
import VerticalLine from "../../icons/VerticalLine";
import obtenerRespuestas from "../../../api/publicaciones/obtenerRespuestas";
import { buildApiUrl } from "../../../config/apiConfig";

const ModalRespuesta = ({ publicacion, onClose, respuestas: respuestasProp, onNuevaRespuesta }) => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [respuestas, setRespuestas] = useState(respuestasProp || []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      obtenerUsuario(parseInt(userId), token).then((res) => {
        if (res?.data) {
          setUsuarioLogueado(res.data);
          // console.log("Usuario logueado:", res.data);
          // console.log("Avatar usuario logueado:", avatarUsuarioLogueado);
        }
      });
    }
  }, []);
  useEffect(() => {
    console.log("Usuario logueado:", usuarioLogueado);
  }, [usuarioLogueado]);

  const manejarRespuesta = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token || !respuestaTexto.trim()) return;

    const payload = {
      usuario_id: parseInt(userId),
      comentario_padre_id: publicacion.id,
      contenido: respuestaTexto.trim(),
    };

    try {
      console.log("🧾 Enviando payload:", payload);
      const response = await fetch(buildApiUrl("/api/comentarios/responder"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.data) {
        console.log("Respuesta enviada correctamente");
        console.log("Datos de la respuesta:", data.data);
        setRespuestas((prev) => [...prev, data.data]);
        setRespuestaTexto("");

        if (onNuevaRespuesta) {
          onNuevaRespuesta();
        }

        const nuevasRespuestas = await obtenerRespuestas({ userId, token });
        console.log("📥 Respuestas actualizadas:", nuevasRespuestas);
      } else {
        alert("❌ No se pudo guardar la respuesta");
      }
    } catch (error) {
      console.error("❌ Error al enviar la respuesta:", error);
      alert("Error al responder el comentario.");
    }
  };

  useEffect(() => {
    const fetchRespuestas = async () => {
      const token = localStorage.getItem("token");

      if (!token || !publicacion?.id) return;

      try {
        const response = await fetch(
          buildApiUrl(`/api/comentarios/${publicacion.id}/conversacion`),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data?.data) {
          console.log("Respuestas cargadas:", data.data);
          setRespuestas(data.data);
        }
      } catch (err) {
        console.error("Error al obtener respuestas:", err);
      }
    };

    fetchRespuestas();
  }, [publicacion]);

  if (!publicacion) return null;

  const avatarOriginal = getAvatarUrl(publicacion.usuario?.avatar);
  return (
    <div className="modal-respuesta-overlay" onClick={onClose}>
      <div className="modal-respuesta" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-respuesta">
          <span className="modal-cancelar" onClick={onClose}>
            Cancelar
          </span>
          <span className="modal-titulo">Responder</span>
          {/* <span className="modal-opciones">⋯</span> */}
        </div>

        <div className="scroll-contenido-respuesta">
          <div className="publicacion-original">
            <div className="container-avatar">
              <img src={avatarOriginal} alt="Avatar" className="avatar-modal-respuesta" />
              <VerticalLine className="vertical-line-dinamica" />
            </div>

            <div className="contenido-comentario">
              <div className="username">{publicacion.usuario?.username}</div>
              <div
                className="texto-Modal-respuesta"
                dangerouslySetInnerHTML={{ __html: publicacion.texto }}
              />
            </div>
          </div>

          <div className="responder-Modal-respuesta">
            <div className="respuestas-guardadas">
              <ModalHilo
                onClose={onClose}
                comentarioIdPadre={publicacion.id}
                comentarioOriginal={publicacion}
                respuestas
              />

              {Array.isArray(respuestas) && respuestas.length > 0 ? (
                respuestas.map((respuesta) => (
                  <div key={respuesta.id} className="respuesta-item">
                    <div className="container-avatar">
                      <img
                        src={getAvatarUrl(respuesta.usuario?.avatar)}
                        alt="avatar"
                        className="avatar-modal-respuesta"
                      />
                      <VerticalLine className="vertical-line-dinamica" />
                    </div>
                    <div className="contenido-comentario">
                      <div className="username">{respuesta.usuario?.username}</div>
                      <div
                        className="texto-Modal-respuesta"
                        dangerouslySetInnerHTML={{ __html: respuesta.contenido }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="sin-respuestas">No hay respuestas aún.</p>
              )}
            </div>

            <div className="acciones">
              <CommentIcon />
              <button className="btn-responder" onClick={manejarRespuesta}>
                Responder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRespuesta;
