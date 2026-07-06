function Home() {
  return (
    <div className="App">
      <h1>Bienvenido a Zenkai Games</h1>
     <header className="navbar">
      
      <div className="logo">  

        <h1>Zenkai Games</h1>
      </div>
       <div>
            <p>Login correcto 🎉</p>
        </div>

      <nav>

        <ul className="menu">

          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#juegos">Juegos</a></li>
          <li><a href="#rankings">Rankings</a></li>
          <li><a href="#noticias">Noticias</a></li>
          <li><a href="#comunidad">Comunidad</a></li>
          <li><a href="#acerca-de">Acerca de</a></li>
        </ul>
      </nav>
      <div className="login">
         <button>Iniciar Sesión</button>
      </div>
       <div className="login">
         <button>Mi Perfil</button>
      </div>

     </header>
     <main>

      {/* Banner Principalº */}

      {/* Juegos Destacados */}

      {/* Recomendaciones */}

      {/* Rankings */}

     </main>

     <footer> 
      {/* Pie de pagina */}
     </footer>
    </div>
  );
}

export default Home