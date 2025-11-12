// src/components/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Publicar from "../components/dashboard/Tabs/TabHilos/Publicar";
import Publicacion from "../components/dashboard/Home/Publicacion";
import "../components/dashboard/Tabs/TabHilos/ModalHilo.css";
import "../css/home.css";
import { obtenerComentarios } from "../../src/api/publicaciones/obtenerComentarios";
import { getAvatarUrl } from "../utils/getAvatarUrl";

const Home = () => {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [avatar, setAvatar] = useState("/default-avatar.png");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar comentarios
        const resultado = await obtenerComentarios();
        console.log("Comentarios recibidos en Home:", resultado);

        if (resultado && Array.isArray(resultado.data)) {
          setComentarios(resultado.data);
        } else {
          console.warn("No se recibió un array en 'data':", resultado);
          setComentarios([]);
        }

        //  Cargar avatar del usuario logueado
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const res = await fetch(`https://dockerapps.pulzo.com/threads/api/usuarios/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const perfil = await res.json();
          if (perfil.data.avatar) {
            setAvatar(getAvatarUrl(perfil.data.avatar));
          }
        }
      } catch (err) {
        console.error("Error cargando los datos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="home-container">
      <Publicar avatar={avatar} />

      <div className="home-content">
        <div className="scroll-publicaciones">
          {cargando ? (
            <p className="loading">Cargando publicaciones...</p>
          ) : comentarios.length === 0 ? (
            <p className="no-posts">No hay publicaciones aún.</p>
          ) : (
            comentarios.map(({ comentario }, index) => {
              if (!comentario || !comentario.usuario) return null;

              return (
                <Publicacion
                  key={comentario.id || index}
                  id={comentario.id}
                  usuario={{
                    id: comentario.usuario.id,
                    name: comentario.usuario.name || "Usuario",
                    username: comentario.usuario.username || "@desconocido",
                    avatar: getAvatarUrl(comentario.usuario.avatar),
                  }}
                  tiempo={new Date(comentario.fecha_creacion).toLocaleString()}
                  texto={comentario.contenido || ""}
                  imagen={null}
                  likes={comentario.me_gusta_total || 0}
                  respuestas={0}
                  compartidos={0}
                  guardados={0}
                  comentarios={comentario.comentarios || []}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
