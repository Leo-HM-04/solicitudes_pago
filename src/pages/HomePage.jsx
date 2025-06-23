import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  return (
    <div className="min-h-screen bg-blue-700 text-white p-6 rounded-3xl">
      {/* Header superior */}
      <div className="flex justify-between items-center mb-6">
        <button className="bg-white text-blue-700 px-4 py-2 rounded-md flex items-center gap-2 shadow-md">
          <span className="text-xl">☰</span>
          <span className="font-medium">Menú</span>
        </button>
        <button className="bg-white text-blue-700 px-4 py-2 rounded-md flex items-center gap-2 shadow-md">
          <span>Notificaciones</span>
          <span className="text-xl">🔔</span>
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Columna izquierda */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            PLATAFORMA DE PAGOS
          </h1>
          <h2 className="text-2xl mb-4 font-medium">
            Aprende a usar la nueva plataforma de bechapra.
          </h2>
          <p className="text-white/90 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <button className="bg-white text-blue-700 font-semibold px-5 py-2 rounded-md shadow">
            ¿Necesitas ayuda?
          </button>
        </div>

        {/* Columna derecha: Video */}
        <div className="relative rounded-md overflow-hidden shadow-lg">
          <img
            src="/video-thumbnail.png" // <- Reemplaza esto con la ruta de tu imagen
            alt="Video tutorial"
            className="w-full rounded-md"
          />
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="bg-white text-blue-700 rounded-full p-4 shadow-lg cursor-pointer">
              <span className="text-4xl">▶</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
