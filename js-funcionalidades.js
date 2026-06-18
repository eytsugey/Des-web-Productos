/* ============================================================
   js-funcionalidades.js
   Integrante 3 - Funcionalidades JavaScript y validaciones
   PonkyStore (sitio estatico, sin base de datos)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     CATALOGO DE PRODUCTOS (datos estaticos)
     --------------------------------------------------------- */
  const productos = [
    { id: 1, nombre: "Audífonos inalámbricos", categoria: "audio", desc: "Bluetooth 5.0 con estuche de carga y cancelación de ruido.", precio: 499, precioAnterior: 699, oferta: true, imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
    { id: 2, nombre: "Teclado mecánico", categoria: "computo", desc: "Compacto, retroiluminado RGB y switches mecánicos.", precio: 899, precioAnterior: 1199, oferta: true, imagen: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80" },
    { id: 3, nombre: "Mouse inalámbrico", categoria: "computo", desc: "Ergonómico, batería recargable y sensor de precisión.", precio: 349, precioAnterior: null, oferta: false, imagen: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80" },
    { id: 4, nombre: "Mochila para laptop", categoria: "accesorios", desc: "Resistente al agua con compartimento acolchado y puerto USB.", precio: 699, precioAnterior: 899, oferta: true, imagen: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80" },
    { id: 5, nombre: "Smartwatch deportivo", categoria: "wearables", desc: "Monitor de ritmo cardíaco, GPS y notificaciones.", precio: 1299, precioAnterior: 1799, oferta: true, imagen: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80" },
    { id: 6, nombre: "Bocina Bluetooth", categoria: "audio", desc: "Sonido envolvente, resistente al agua y 12h de batería.", precio: 599, precioAnterior: null, oferta: false, imagen: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80" },
    { id: 7, nombre: "Cámara web HD", categoria: "computo", desc: "1080p con micrófono integrado, ideal para videollamadas.", precio: 449, precioAnterior: null, oferta: false, imagen: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=900&q=80" },
    { id: 8, nombre: "Cargador rápido USB-C", categoria: "accesorios", desc: "Carga rápida de 65W para laptop y smartphone.", precio: 299, precioAnterior: 449, oferta: true, imagen: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80" },
  ];

  // Estado (se guarda en localStorage)
  let carrito = cargar("ponky_carrito", []);
  let favoritos = new Set(cargar("ponky_favoritos", []));

  // Estado de filtros
  let filtroCategoria = "todos";
  let textoBusqueda = "";
  let orden = "";

  // Referencias del DOM
  const contadorCarrito = document.getElementById("contador-carrito");
  const contadorFavoritos = document.getElementById("contador-favoritos");
  const modalCarrito = document.getElementById("modal-carrito");
  const modalFavoritos = document.getElementById("modal-favoritos");
  const modalPago = document.getElementById("modal-pago");
  const modalExito = document.getElementById("modal-exito");
  const modalPromo = document.getElementById("modal-promo");
  const listaCarrito = document.getElementById("lista-carrito");
  const listaFavoritos = document.getElementById("lista-favoritos");
  const totalCarrito = document.getElementById("total-carrito");
  const totalPago = document.getElementById("total-pago");
  const contenedorToasts = document.getElementById("contenedor-toasts");

  /* =========================================================
     UTILIDADES
     ========================================================= */
  function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-MX") + " MXN";
  }
  function calcularTotal() {
    return carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }
  function cargar(clave, predeterminado) {
    try {
      const dato = localStorage.getItem(clave);
      return dato ? JSON.parse(dato) : predeterminado;
    } catch (e) { return predeterminado; }
  }

  /* =========================================================
     1. NOTIFICACIONES (TOAST) - centro superior
     ========================================================= */
  function mostrarToast(mensaje, tipo = "exito") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    const iconos = { exito: "✅", error: "⚠️", info: "ℹ️" };
    toast.innerHTML = `<span class="toast__icono">${iconos[tipo] || "ℹ️"}</span> ${mensaje}`;
    contenedorToasts.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast--visible"));
    setTimeout(() => {
      toast.classList.remove("toast--visible");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 3000);
  }

  /* =========================================================
     2. RENDER DE PRODUCTOS
     ========================================================= */
  function crearCard(p) {
    const descuento = p.oferta && p.precioAnterior
      ? Math.round((1 - p.precio / p.precioAnterior) * 100) : 0;
    const badge = p.oferta ? `<span class="badge-oferta">-${descuento}%</span>` : "";
    const precioAnterior = p.oferta && p.precioAnterior
      ? `<span class="precio-anterior">${formatearPrecio(p.precioAnterior)}</span>` : "";
    const esFav = favoritos.has(p.id);

    return `
      <article class="producto">
        <div class="producto__img">
          ${badge}
          <button type="button" class="btn-fav ${esFav ? "activo" : ""}" data-fav="${p.id}" title="Favorito">
            ${esFav ? "❤️" : "🤍"}
          </button>
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
               onerror="this.src='https://placehold.co/600x400/eef0f5/ff6b35?text=PonkyStore'">
        </div>
        <div class="producto__cuerpo">
          <h3>${p.nombre}</h3>
          <p class="producto__desc">${p.desc}</p>
          <div class="producto__precios">
            <span class="precio-actual">${formatearPrecio(p.precio)}</span>
            ${precioAnterior}
          </div>
          <button type="button" class="btn-comprar" data-id="${p.id}">Agregar al carrito</button>
        </div>
      </article>
    `;
  }

  // Productos con filtros + busqueda + orden (solo grid principal)
  function aplicarFiltros() {
    let lista = [...productos];

    if (filtroCategoria === "oferta") {
      lista = lista.filter((p) => p.oferta);
    } else if (filtroCategoria !== "todos") {
      lista = lista.filter((p) => p.categoria === filtroCategoria);
    }

    if (textoBusqueda) {
      const t = textoBusqueda.toLowerCase();
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(t) || p.desc.toLowerCase().includes(t));
    }

    if (orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
    else if (orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
    else if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

    document.getElementById("grid-productos").innerHTML = lista.map(crearCard).join("");
    document.getElementById("sin-resultados").classList.toggle("oculto", lista.length > 0);
  }

  function renderTodo() {
    aplicarFiltros();
    document.getElementById("grid-destacados").innerHTML =
      productos.slice(0, 4).map(crearCard).join("");
    document.getElementById("grid-ofertas").innerHTML =
      productos.filter((p) => p.oferta).map(crearCard).join("");
  }

  /* =========================================================
     3. BUSCADOR, ORDEN Y FILTROS
     ========================================================= */
  document.getElementById("buscador").addEventListener("input", (e) => {
    textoBusqueda = e.target.value.trim();
    aplicarFiltros();
  });

  document.getElementById("ordenar").addEventListener("change", (e) => {
    orden = e.target.value;
    aplicarFiltros();
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
      chip.classList.add("activo");
      filtroCategoria = chip.dataset.cat;
      aplicarFiltros();
    });
  });

  /* =========================================================
     4. CLICS EN LAS CARDS (agregar al carrito / favorito)
     ========================================================= */
  document.addEventListener("click", (evento) => {
    const btnComprar = evento.target.closest(".btn-comprar");
    if (btnComprar) {
      const producto = productos.find((p) => p.id === Number(btnComprar.dataset.id));
      if (producto) {
        agregarAlCarrito(producto);
        mostrarToast(`"${producto.nombre}" se agregó al carrito`, "exito");
      }
      return;
    }

    const btnFav = evento.target.closest(".btn-fav");
    if (btnFav) {
      alternarFavorito(Number(btnFav.dataset.fav));
    }
  });

  /* =========================================================
     5. NAVEGACION POR SECCIONES (TABS estilo SPA)
     ========================================================= */
  const secciones = document.querySelectorAll(".seccion");
  const enlaces = document.querySelectorAll(".nav__link");

  function mostrarSeccion(id) {
    secciones.forEach((s) => s.classList.toggle("seccion--activa", s.id === id));
    enlaces.forEach((e) => e.classList.toggle("activo", e.dataset.seccion === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  enlaces.forEach((e) => e.addEventListener("click", () => mostrarSeccion(e.dataset.seccion)));
  document.querySelectorAll("[data-ir]").forEach((el) =>
    el.addEventListener("click", () => mostrarSeccion(el.dataset.ir)));

  /* =========================================================
     6. CARRITO
     ========================================================= */
  function agregarAlCarrito(producto) {
    const existente = carrito.find((i) => i.id === producto.id);
    if (existente) existente.cantidad += 1;
    else carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: 1 });
    actualizarCarrito();
  }

  function actualizarCarrito() {
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
    contadorCarrito.textContent = totalItems;
    contadorCarrito.classList.toggle("oculto", totalItems === 0);
    guardar("ponky_carrito", carrito);

    listaCarrito.innerHTML = "";
    if (carrito.length === 0) {
      listaCarrito.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío 🛒</p>`;
      totalCarrito.textContent = formatearPrecio(0);
      return;
    }

    carrito.forEach((item, indice) => {
      const fila = document.createElement("div");
      fila.className = "carrito-item";
      fila.innerHTML = `
        <img class="carrito-item__img" src="${item.imagen}" alt="${item.nombre}"
             onerror="this.src='https://placehold.co/80x80/eef0f5/ff6b35?text=%20'">
        <div class="carrito-item__info">
          <strong>${item.nombre}</strong>
          <span>${formatearPrecio(item.precio)} c/u</span>
        </div>
        <div class="carrito-item__controles">
          <button class="btn-cantidad" data-accion="restar" data-indice="${indice}">−</button>
          <span class="cantidad">${item.cantidad}</span>
          <button class="btn-cantidad" data-accion="sumar" data-indice="${indice}">+</button>
          <button class="btn-eliminar" data-indice="${indice}" title="Eliminar">🗑️</button>
        </div>`;
      listaCarrito.appendChild(fila);
    });
    totalCarrito.textContent = formatearPrecio(calcularTotal());
  }

  listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    const indice = Number(boton.dataset.indice);
    if (boton.classList.contains("btn-eliminar")) {
      const nombre = carrito[indice].nombre;
      carrito.splice(indice, 1);
      mostrarToast(`"${nombre}" se eliminó del carrito`, "info");
    } else if (boton.dataset.accion === "sumar") {
      carrito[indice].cantidad += 1;
    } else if (boton.dataset.accion === "restar") {
      carrito[indice].cantidad -= 1;
      if (carrito[indice].cantidad <= 0) carrito.splice(indice, 1);
    }
    actualizarCarrito();
  });

  /* =========================================================
     7. FAVORITOS
     ========================================================= */
  function alternarFavorito(id) {
    const producto = productos.find((p) => p.id === id);
    if (favoritos.has(id)) {
      favoritos.delete(id);
      mostrarToast(`"${producto.nombre}" se quitó de favoritos`, "info");
    } else {
      favoritos.add(id);
      mostrarToast(`"${producto.nombre}" se agregó a favoritos ❤️`, "exito");
    }
    guardar("ponky_favoritos", [...favoritos]);
    actualizarFavoritos();
    renderTodo(); // refrescar corazones en las cards
  }

  function actualizarFavoritos() {
    contadorFavoritos.textContent = favoritos.size;
    contadorFavoritos.classList.toggle("oculto", favoritos.size === 0);

    listaFavoritos.innerHTML = "";
    if (favoritos.size === 0) {
      listaFavoritos.innerHTML = `<p class="carrito-vacio">Aún no tienes favoritos 🤍</p>`;
      return;
    }
    productos.filter((p) => favoritos.has(p.id)).forEach((item) => {
      const fila = document.createElement("div");
      fila.className = "carrito-item";
      fila.innerHTML = `
        <img class="carrito-item__img" src="${item.imagen}" alt="${item.nombre}"
             onerror="this.src='https://placehold.co/80x80/eef0f5/ff6b35?text=%20'">
        <div class="carrito-item__info">
          <strong>${item.nombre}</strong>
          <span>${formatearPrecio(item.precio)}</span>
        </div>
        <div class="carrito-item__controles">
          <button class="btn-comprar btn-comprar--mini" data-id="${item.id}">Agregar 🛒</button>
          <button class="btn-eliminar" data-fav="${item.id}" title="Quitar">🗑️</button>
        </div>`;
      listaFavoritos.appendChild(fila);
    });
  }

  listaFavoritos.addEventListener("click", (evento) => {
    const quitar = evento.target.closest(".btn-eliminar");
    if (quitar) alternarFavorito(Number(quitar.dataset.fav));
  });

  /* =========================================================
     8. ABRIR / CERRAR MODALES
     ========================================================= */
  const abrir = (m) => m.classList.add("modal--visible");
  const cerrar = (m) => m.classList.remove("modal--visible");

  document.getElementById("abrir-carrito").addEventListener("click", () => abrir(modalCarrito));
  document.getElementById("cerrar-carrito").addEventListener("click", () => cerrar(modalCarrito));
  document.getElementById("abrir-favoritos").addEventListener("click", () => abrir(modalFavoritos));
  document.getElementById("cerrar-favoritos").addEventListener("click", () => cerrar(modalFavoritos));
  document.getElementById("cerrar-pago").addEventListener("click", () => cerrar(modalPago));
  document.getElementById("cerrar-exito").addEventListener("click", () => cerrar(modalExito));
  document.getElementById("cerrar-promo").addEventListener("click", () => cerrar(modalPromo));
  document.getElementById("promo-ofertas").addEventListener("click", () => {
    cerrar(modalPromo);
    mostrarSeccion("ofertas");
  });

  const todosModales = [modalCarrito, modalFavoritos, modalPago, modalExito, modalPromo];
  todosModales.forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target === m) cerrar(m); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") todosModales.forEach(cerrar);
  });

  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    if (carrito.length === 0) { mostrarToast("El carrito ya está vacío", "info"); return; }
    carrito = [];
    actualizarCarrito();
    mostrarToast("Carrito vaciado", "info");
  });

  /* =========================================================
     9. PROCESO DE PAGO
     ========================================================= */
  const camposTarjeta = document.getElementById("campos-tarjeta");
  let metodoSeleccionado = null;

  document.getElementById("ir-pago").addEventListener("click", () => {
    if (carrito.length === 0) { mostrarToast("Agrega productos antes de pagar", "error"); return; }
    cerrar(modalCarrito);
    reiniciarPago();
    totalPago.textContent = formatearPrecio(calcularTotal());
    abrir(modalPago);
  });

  function reiniciarPago() {
    metodoSeleccionado = null;
    camposTarjeta.classList.add("oculto");
    document.querySelectorAll(".metodo").forEach((m) => m.classList.remove("activo"));
    ["tarjeta-numero", "tarjeta-nombre", "tarjeta-vence", "tarjeta-cvv"].forEach((id) => {
      const c = document.getElementById(id); if (c) c.value = "";
    });
  }

  document.querySelectorAll(".metodo").forEach((boton) => {
    boton.addEventListener("click", () => {
      metodoSeleccionado = boton.dataset.metodo;
      document.querySelectorAll(".metodo").forEach((m) => m.classList.remove("activo"));
      boton.classList.add("activo");
      camposTarjeta.classList.toggle("oculto", metodoSeleccionado !== "tarjeta");
    });
  });

  document.getElementById("confirmar-pago").addEventListener("click", () => {
    if (!metodoSeleccionado) { mostrarToast("Selecciona un método de pago", "error"); return; }

    if (metodoSeleccionado === "tarjeta") {
      const numero = document.getElementById("tarjeta-numero").value.replace(/\s/g, "");
      const nombre = document.getElementById("tarjeta-nombre").value.trim();
      const vence = document.getElementById("tarjeta-vence").value.trim();
      const cvv = document.getElementById("tarjeta-cvv").value.trim();
      if (!/^\d{16}$/.test(numero)) { mostrarToast("El número de tarjeta debe tener 16 dígitos", "error"); return; }
      if (nombre === "") { mostrarToast("Ingresa el nombre del titular", "error"); return; }
      if (!/^\d{2}\/\d{2}$/.test(vence)) { mostrarToast("La fecha debe tener el formato MM/AA", "error"); return; }
      if (!/^\d{3,4}$/.test(cvv)) { mostrarToast("El CVV debe tener 3 o 4 dígitos", "error"); return; }
    }

    const total = calcularTotal();
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
    const nombres = { tarjeta: "Tarjeta", paypal: "PayPal", transferencia: "Transferencia", oxxo: "OXXO" };

    document.getElementById("exito-detalle").innerHTML =
      `Pagaste <strong>${formatearPrecio(total)}</strong> (${totalItems} producto(s)) con <strong>${nombres[metodoSeleccionado]}</strong>.<br>Tu pedido llegará en 24 a 48 horas. 🚚`;

    carrito = [];
    actualizarCarrito();
    cerrar(modalPago);
    abrir(modalExito);
  });

  /* =========================================================
     10. VALIDACION DEL FORMULARIO DE CONTACTO
     ========================================================= */
  const formContacto = document.getElementById("form-contacto");
  if (formContacto) {
    formContacto.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const nombre = formContacto.nombre.value.trim();
      const correo = formContacto.correo.value.trim();
      const mensaje = formContacto.mensaje.value.trim();
      if (nombre === "" || correo === "" || mensaje === "") { mostrarToast("Por favor completa todos los campos", "error"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { mostrarToast("Ingresa un correo electrónico válido", "error"); return; }
      if (mensaje.length < 10) { mostrarToast("El mensaje debe tener al menos 10 caracteres", "error"); return; }
      mostrarToast(`¡Gracias ${nombre}! Tu mensaje fue enviado`, "exito");
      formContacto.reset();
    });
  }

  /* =========================================================
     INICIALIZACION
     ========================================================= */
  renderTodo();
  actualizarCarrito();
  actualizarFavoritos();

  // Mostrar el popup de promo al entrar (pequeño retraso para que se note)
  setTimeout(() => abrir(modalPromo), 700);
});
