import React, { useEffect, useMemo, useState } from "react";
import TareasPerfil from "./TabHilos/TareasPerfil";
import { darLikeComentario } from "../../../api/publicaciones/darLikeComentario";
import { eliminarLikeComentario } from "../../../api/publicaciones/eliminarLikeComentario";
import { obtenerLikesComentario } from "../../../api/publicaciones/obtenerLikesComentario";
import CommentIcon from "../../icons/CommentIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import HeartIcon from "../../icons/HeartIcon";
import RepostIcon from "../../icons/RepostIcon";
import SaveIcon from "../../icons/SaveIcon";
import Publicar from "./TabHilos/Publicar";
import { getAvatarUrl } from "../../../utils/getAvatarUrl";
import "./tabHilos.css";

const TabHilos = ({ avatar, publicaciones }) => {
  const publicacionesLista = useMemo(
    () => (Array.isArray(publicaciones) ? publicaciones : []),
    [publicaciones]
  );

  const [likesPorPublicacion, setLikesPorPublicacion] = useState({});
  const userId = parseInt(localStorage.getItem("userId"));

  const handleLikeComentario = async (publicacionId) => {
    try {
      const { liked, count } = likesPorPublicacion[publicacionId] || { liked: false, count: 0 };
      const newLikeState = !liked;

      if (newLikeState) {
        await darLikeComentario(publicacionId, userId);
      } else {
        await eliminarLikeComentario(publicacionId, userId);
      }

      setLikesPorPublicacion((prevState) => {
        const updatedLikes = { ...prevState };
        updatedLikes[publicacionId] = {
          liked: newLikeState,
          count: newLikeState ? count + 1 : Math.max(count - 1, 0),
        };
        return updatedLikes;
      });
    } catch (error) {
      console.error("Error al manejar el like:", error);
    }
  };

  useEffect(() => {
    const verificarLikesPublicaciones = async () => {
      try {
        const nuevosLikes = {};

        for (const pub of publicacionesLista) {
          const usuariosQueDieronLike = await obtenerLikesComentario(pub.id);
          console.log(`Likes para la publicación ${pub.id}:`, usuariosQueDieronLike);

          const yaDioLike = usuariosQueDieronLike.some((u) => u.id === userId);

          nuevosLikes[pub.id] = {
            liked: yaDioLike,
            count: pub.me_gusta_total || 0,
          };
        }

        setLikesPorPublicacion(nuevosLikes);
      } catch (error) {
        console.error("Error verificando likes en las publicaciones:", error);
      }
    };

    verificarLikesPublicaciones();
  }, [publicacionesLista, userId]);

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="tab-hilos">
      <Publicar avatar={avatar} />
      <TareasPerfil />

      {publicacionesLista.length === 0 ? (
        <p>No has publicado ningún hilo todavía.</p>
      ) : (
        publicacionesLista.map((pub) => (
          <div key={pub.id} className="post-tabHilos">
            <div className="container-posts-tabHilos">
              <div className="post-avatar">
                <img src={getAvatarUrl(avatar)} alt="avatar" className="avatar" />
              </div>
            </div>

            <div className="post-body">
              <div className="post-header">
                <div className="user-info">
                  <span className="username">{pub.usuario.username}</span>
                  <span className="time">{pub.fecha_creacion}</span>
                </div>
              </div>

              <div
                className="post-texto"
                dangerouslySetInnerHTML={{ __html: decodeHTML(pub.contenido) }}
              />
              {pub.imagen && (
                <div className="post-media">
                  <img src={pub.imagen} alt="contenido" />
                </div>
              )}

              <div className="post-footer">
                <span onClick={() => handleLikeComentario(pub.id)}>
                  <HeartIcon
                    filled={likesPorPublicacion[pub.id]?.liked}
                    color={likesPorPublicacion[pub.id]?.liked ? "red" : "currentColor"}
                  />
                  <span>{likesPorPublicacion[pub.id]?.count || 0}</span>
                </span>

                <span>
                  <CommentIcon />
                </span>

                <span>
                  <RepostIcon />
                </span>

                <span>
                  <DeleteIcon />
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TabHilos;
