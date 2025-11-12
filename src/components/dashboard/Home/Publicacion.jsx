import React, { useState, useEffect } from "react";
import "./Publicacion.css";
import HeartIcon from "../../icons/HeartIcon";
import CommentIcon from "../../icons/CommentIcon";
import RepostIcon from "../../icons/RepostIcon";
import SaveIcon from "../../icons/SaveIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import ModalPerfilUsuario from "../Home/ModalPerfilUsuario";
import ModalRespuesta from "./ModalRespuesta";
import { darLikeComentario } from "../../../api/publicaciones/darLikeComentario";
import { obtenerLikesComentario } from "../../../api/publicaciones/obtenerLikesComentario";
import { eliminarLikeComentario } from "../../../api/publicaciones/eliminarLikeComentario";
import { eliminarComentario } from "../../../api/publicaciones/eliminarComentario";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";

const Publicacion = ({
  id,
  usuario,
  tiempo,
  texto,
  imagen,
  likes,
  respuestas,
  compartidos,
  guardados,
  comentarios = [],
}) => {
  const [liked, setLiked] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [comentariosConLike, setComentariosConLike] = useState([]);
  const [modalRespuestasAbierto, setModalRespuestasAbierto] = useState(false);

  const userId = parseInt(localStorage.getItem("userId"));

  const handleLikeComentario = async (comentarioId) => {
    try {
      const comentarioActual = comentariosConLike.find((c) => c.id === comentarioId);
      if (comentarioActual) {
        if (!comentarioActual?.me_gusta_usuario) {
          await darLikeComentario(comentarioId, userId);
        } else {
          await eliminarLikeComentario(comentarioId, userId);
        }

        const usuariosQueDieronLike = await obtenerLikesComentario(comentarioId);
        const yaDioLike = usuariosQueDieronLike.some((u) => u.id === userId);

        setComentariosConLike((prev) =>
          prev.map((c) =>
            c.id === comentarioId
              ? {
                  ...c,
                  me_gusta_usuario: yaDioLike,
                  me_gusta_total: yaDioLike
                    ? (c.me_gusta_total || 0) + 1
                    : Math.max((c.me_gusta_total || 1) - 1, 0),
                }
              : c
          )
        );
      } else {
        if (!liked) {
          const res = await darLikeComentario(comentarioId, userId);
          if (res?.code === 200) {
            setLiked(true);
            setLikeCount((prev) => prev + 1);
          }
        } else {
          const res = await eliminarLikeComentario(comentarioId, userId);
          if (res?.code === 200) {
            setLiked(false);
            setLikeCount((prev) => Math.max(prev - 1, 0));
          }
        }
      }
    } catch (error) {
      console.error("Error manejando el like:", error);
    }
  };

  const handleEliminarComentario = async (comentarioId) => {
    console.log(" Usuario logueado:", userId);
    console.log(" Comentario :", comentarioId);
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este comentario?");
    if (!confirmDelete) return;

    try {
      console.log("🧪 Eliminando comentario:", { userId, comentarioId });
      const res = await eliminarComentario(userId, comentarioId);
      if (res?.code === 200) {
        setComentariosConLike((prev) => prev.filter((c) => c.comentario.id !== comentarioId));
      } else {
        console.error("❌ Error al eliminar el comentario:", res?.message);
      }
    } catch (error) {
      console.error("❌ Error en handleEliminarComentario:", error);
    }
  };

  useEffect(() => {
    const verificarLikePublicacion = async () => {
      try {
        const usuariosQueDieronLike = await obtenerLikesComentario(id);
        const yaDioLike = usuariosQueDieronLike.some((u) => u.id === userId);
        setLiked(yaDioLike);
      } catch (error) {
        console.error("Error verificando like en la publicación:", error);
      }
    };

    verificarLikePublicacion();
  }, [id, userId]);

  useEffect(() => {
    const cargarLikes = async () => {
      const nuevosComentarios = await Promise.all(
        comentarios.map(async ({ comentario }) => {
          const usuariosQueDieronLike = await obtenerLikesComentario(comentario.id);
          const yaDioLike = usuariosQueDieronLike.some((u) => u.id === userId);
          return {
            ...comentario,
            me_gusta_usuario: yaDioLike,
          };
        })
      );
      setComentariosConLike(nuevosComentarios);
    };

    cargarLikes();
  }, [comentarios, userId]);

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // console.log("📦 respuestas recibidas:", respuestas);

  return (
    <div className="post">
      <div className="container-posts">
        <div
          className="post-avatar"
          onClick={() => setModalAbierto(true)}
          style={{ cursor: "pointer" }}
        >
          <img src={getAvatarUrl(usuario.avatar)} className="avatar" alt="avatar" />
        </div>

        <div className="post-body">
          <div className="post-header">
            <div className="user-info">
              <span className="username">{usuario.username}</span>
              <span className="time">{tiempo}</span>
            </div>
          </div>

          <div className="post-texto" dangerouslySetInnerHTML={{ __html: decodeHTML(texto) }} />

          {imagen && (
            <div className="post-media">
              <img src={imagen} alt="contenido" />
            </div>
          )}

          <div className="post-footer">
            <span onClick={() => handleLikeComentario(id)}>
              <HeartIcon filled={liked} color={liked ? "red" : "currentColor"} />
              <span>{likeCount}</span>
            </span>

            <span onClick={() => setModalRespuestasAbierto(true)}>
              <CommentIcon />
              <span>{respuestas}</span>
            </span>

            <span>
              <RepostIcon />
              <span>{compartidos}</span>
            </span>
            <span>
              <SaveIcon />
              <span>{guardados}</span>
            </span>
            <span onClick={() => handleEliminarComentario(id)}>
              <DeleteIcon />
            </span>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <ModalPerfilUsuario usuarioASeguir={usuario} onClose={() => setModalAbierto(false)} />
      )}

      {modalRespuestasAbierto && (
        <ModalRespuesta
          onClose={() => setModalRespuestasAbierto(false)}
          publicacion={{ usuario, texto, id }} // puedes pasar más campos si los usas luego
          // respuestas={comentariosConLike}
        />
      )}
    </div>
  );
};

export default Publicacion;
