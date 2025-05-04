// -----------------------------------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (Estilo v8)
// -----------------------------------------------------------------------------

// ¡ASEGÚRATE DE QUE ESTA CONFIGURACIÓN SEA CORRECTA Y COINCIDA CON TU PROYECTO!
const firebaseConfig = {
    apiKey: "AIzaSyCbO-XO7ZeWVDmL-uYYelB936yzzPTZE_I", // Tu API Key
    authDomain: "mi-app-autenticacion-99593.firebaseapp.com", // Tu Auth Domain
    databaseURL: "https://mi-app-autenticacion-99593-default-rtdb.firebaseio.com", // Tu Database URL
    projectId: "mi-app-autenticacion-99593", // Tu Project ID
    storageBucket: "mi-app-autenticacion-99593.appspot.com", // Tu Storage Bucket (CORREGIDO: suele terminar en .appspot.com)
    messagingSenderId: "310526147288", // Tu Messaging Sender ID
    appId: "1:310526147288:web:b1c65a6a7d4f22f804b5ad" // Tu App ID
};

// Inicializar Firebase (Estilo v8)
// Esta línea es la única necesaria para inicializar con v8
// Asegúrate de que los scripts SDK v8 estén en index.html
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado correctamente (v8).");
} catch (e) {
    console.error("Error inicializando Firebase:", e);
    alert("Error crítico: No se pudo inicializar Firebase. Revisa la consola y la configuración.");
}


// Referencias a los servicios de Firebase (Estilo v8)
// Estas líneas fallarán si initializeApp no funcionó o si los SDKs no están cargados.
let auth, db, storage;
try {
     auth = firebase.auth();
     db = firebase.database();
     storage = firebase.storage();
     console.log("Servicios Firebase (Auth, DB, Storage) referenciados.");
} catch(e) {
    console.error("Error obteniendo referencias a servicios Firebase:", e);
    console.error("Asegúrate de que los scripts de firebase-auth, firebase-database y firebase-storage estén incluidos en tu index.html ANTES que script.js");
    alert("Error crítico: No se pudieron cargar los módulos de Firebase (Auth, Database, Storage). Revisa la consola y los scripts en index.html.");
}


// -----------------------------------------------------------------------------
// 2. REFERENCIAS A ELEMENTOS DEL DOM
// -----------------------------------------------------------------------------
console.log("Obteniendo referencias del DOM...");

// Contenedores principales
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');

// Formularios de autenticación
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const googleSigninButton = document.getElementById('google-signin-button');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Contenedor de la app
const sidebarLinks = document.querySelectorAll('#sidebar nav a');
const mainContent = document.getElementById('main-content');
const contentSections = document.querySelectorAll('.content-section');
const userEmailDisplay = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

// Sección Datos Personales
const personalDataForm = document.getElementById('personal-data-form');
const pdNombreInput = document.getElementById('pd-nombre');
const pdDireccionInput = document.getElementById('pd-direccion');
const pdTelefonoInput = document.getElementById('pd-telefono');
const pdSaveStatus = document.getElementById('pd-save-status');

// Sección Subir Archivos
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');
const fileList = document.getElementById('file-list');

// Sección Datos en Tiempo Real
const realtimeDataForm = document.getElementById('realtime-data-form');
const rtItemInput = document.getElementById('rt-item');
const rtValueInput = document.getElementById('rt-value');
const rtSaveStatus = document.getElementById('rt-save-status');
const realtimeList = document.getElementById('realtime-list');

// Sección Información de Empresa
const companyInfoForm = document.getElementById('company-info-form');
const ciSaveStatus = document.getElementById('ci-save-status');

// Variable global para el usuario actual
let currentUser = null;
let currentUserId = null;
let realtimeDataListener = null; // Para poder quitar el listener al cerrar sesión
let fileDataListener = null; // Para los archivos

console.log("Referencias del DOM obtenidas.");

// -----------------------------------------------------------------------------
// 3. LÓGICA DE AUTENTICACIÓN
// -----------------------------------------------------------------------------
console.log("Configurando lógica de autenticación...");

// --- Verificaciones iniciales ---
if (!auth || !db || !storage) {
     console.error("¡ERROR CRÍTICO! Los servicios de Firebase no están disponibles. El resto del script no funcionará.");
     alert("Error: Los servicios de Firebase no se cargaron correctamente. Revisa la consola.");
} else {

    // Cambiar entre formularios de login y signup
    if(showSignupLink && showLoginLink && loginForm && signupForm) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            if(loginError) loginError.textContent = '';
            if(signupError) signupError.textContent = '';
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
             if(loginError) loginError.textContent = '';
            if(signupError) signupError.textContent = '';
        });
        console.log("Listeners para mostrar/ocultar formularios configurados.");
    } else {
        console.error("Error: No se encontraron los elementos para cambiar entre login/signup.");
    }


    // Registro con Correo/Contraseña
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            const email = signupEmailInput.value;
            const password = signupPasswordInput.value;
            if(signupError) signupError.textContent = ''; // Limpiar error

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('Usuario registrado:', userCredential.user);
                    // No es necesario hacer nada más, onAuthStateChanged se encargará
                })
                .catch((error) => {
                    console.error('Error de registro:', error);
                    if(signupError) signupError.textContent = `Error: ${error.message}`;
                });
        });
        console.log("Listener para botón de registro configurado.");
    } else {
         console.error("Error: Botón de registro no encontrado.");
    }

    // Inicio de Sesión con Correo/Contraseña
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;
             if(loginError) loginError.textContent = ''; // Limpiar error

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('Usuario inició sesión:', userCredential.user);
                    // No es necesario hacer nada más, onAuthStateChanged se encargará
                })
                .catch((error) => {
                    console.error('Error de inicio de sesión:', error);
                    if(loginError) loginError.textContent = `Error: ${error.message}`;
                });
        });
         console.log("Listener para botón de login configurado.");
     } else {
         console.error("Error: Botón de login no encontrado.");
    }

    // Inicio de Sesión con Google
    if (googleSigninButton) {
        googleSigninButton.addEventListener('click', async () => {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.setCustomParameters({
                    prompt: 'select_account'
                });
                
                // Limpiar cualquier error previo
                if(loginError) loginError.textContent = '';
                
                // Usar signInWithRedirect en lugar de signInWithPopup
                await firebase.auth().signInWithRedirect(provider);
                
            } catch (error) {
                console.error('Error de inicio de sesión con Google:', error);
                if(loginError) {
                    loginError.textContent = `Error: ${error.message}`;
                    loginError.style.color = 'red';
                }
            }
        });
    }

    // Agregar el manejador para la redirección
    firebase.auth().getRedirectResult().then((result) => {
        if (result.user) {
            console.log('Usuario ha iniciado sesión con Google:', result.user);
        }
    }).catch((error) => {
        console.error('Error después de redirección:', error);
        if(loginError) {
            loginError.textContent = `Error: ${error.message}`;
            loginError.style.color = 'red';
        }
    });

    // Cerrar Sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('Sesión cerrada');
                    // onAuthStateChanged se encargará de la UI
                })
                .catch((error) => {
                    console.error('Error al cerrar sesión:', error);
                });
        });
        console.log("Listener para botón de logout configurado.");
    } else {
         console.error("Error: Botón de logout no encontrado.");
    }


    // Observador del estado de autenticación (LA PARTE MÁS IMPORTANTE)
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Usuario ha iniciado sesión
            currentUser = user;
            currentUserId = user.uid;
            console.log('onAuthStateChanged: Usuario autenticado:', currentUserId, user.email);

            // Actualizar UI
            if(userEmailDisplay) userEmailDisplay.textContent = user.email || 'No email';
            if(authContainer) authContainer.style.display = 'none'; // Ocultar login/signup
            if(appContainer) appContainer.style.display = 'flex'; // Mostrar app principal (era 'flex' en CSS)

            // Limpiar errores y campos de formularios de auth
            if(loginError) loginError.textContent = '';
            if(signupError) signupError.textContent = '';
            if(loginEmailInput) loginEmailInput.value = '';
            if(loginPasswordInput) loginPasswordInput.value = '';
            if(signupEmailInput) signupEmailInput.value = '';
            if(signupPasswordInput) signupPasswordInput.value = '';

            // Configurar la primera sección visible (p.ej., Datos Personales)
            navigateToSection('personal-data');
            // Cargar datos iniciales y configurar listeners de datos
            loadPersonalData();
            setupRealtimeDataListener();
            setupFileDataListener();

        } else {
            // Usuario ha cerrado sesión o no está autenticado
             console.log('onAuthStateChanged: Usuario no autenticado.');
            currentUser = null;
            // Asegurarse que currentUserId es null ANTES de intentar quitar listeners
            const oldUserId = currentUserId;
            currentUserId = null;


            // Limpiar listeners para evitar fugas de memoria y errores
            // Importante usar el ID del usuario que cerró sesión (oldUserId)
            if (realtimeDataListener && oldUserId) {
                 try {
                    db.ref(`realtimeItems/${oldUserId}`).off('value', realtimeDataListener);
                    console.log("Listener de datos en tiempo real eliminado para:", oldUserId);
                 } catch(e) { console.error("Error al quitar listener RTDB:", e)}
                 realtimeDataListener = null;
            }
             if (fileDataListener && oldUserId) {
                 try {
                    db.ref(`userFiles/${oldUserId}`).off('value', fileDataListener);
                    console.log("Listener de archivos eliminado para:", oldUserId);
                 } catch(e) { console.error("Error al quitar listener de archivos:", e)}
                 fileDataListener = null;
            }

            // Actualizar UI
            if(authContainer) authContainer.style.display = 'block'; // Mostrar login/signup
            if(appContainer) appContainer.style.display = 'none'; // Ocultar app principal
            if(userEmailDisplay) userEmailDisplay.textContent = '';
            // Limpiar datos de las secciones
            clearAllSections();
        }
    });
    console.log("Observador onAuthStateChanged configurado.");

} // Fin del bloque if (!auth || !db || !storage)


// -----------------------------------------------------------------------------
// 4. NAVEGACIÓN DEL SIDEBAR Y GESTIÓN DE SECCIONES
// -----------------------------------------------------------------------------
console.log("Configurando navegación del sidebar...");

// Función para mostrar una sección y ocultar las demás
function showSection(sectionId) {
     console.log(`showSection llamada para: ${sectionId}`);
     if (!contentSections || contentSections.length === 0) {
          console.error("Error: No se encontraron las secciones de contenido.");
          return;
     }
    contentSections.forEach(section => {
        // Asegurarse que section y section.id existen
        if (section && section.id) {
            if (section.id === sectionId + '-section') {
                section.style.display = 'block';
                 console.log(`Mostrando sección: ${section.id}`);
            } else {
                section.style.display = 'none';
            }
        } else {
             console.warn("Se encontró una sección inválida o sin ID.");
        }
    });

    // Actualizar estilo activo en el sidebar
    if (!sidebarLinks || sidebarLinks.length === 0) {
         console.error("Error: No se encontraron los enlaces del sidebar.");
         return;
    }
    sidebarLinks.forEach(link => {
         // Asegurarse que link y link.dataset existen
         if(link && link.dataset) {
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
         } else {
             console.warn("Se encontró un enlace de sidebar inválido o sin dataset.");
         }
    });
}

// Manejador de clics en los enlaces del sidebar
if (sidebarLinks && sidebarLinks.length > 0) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamiento por defecto del enlace
            if (e.target && e.target.dataset) {
                const sectionId = e.target.dataset.section;
                if (sectionId) {
                    navigateToSection(sectionId);
                } else {
                    console.warn("El enlace clickeado no tiene 'data-section'.");
                }
            }
        });
    });
    console.log("Listeners para enlaces del sidebar configurados.");
} else {
     console.error("Error: No se pudieron configurar los listeners del sidebar (no se encontraron enlaces).");
}


// Función para navegar a una sección (puede incluir carga de datos)
function navigateToSection(sectionId) {
    console.log(`Navegando a: ${sectionId}`);
    showSection(sectionId); // Muestra/oculta divs

    // Cargar datos específicos si es necesario al mostrar la sección
    // Solo si el usuario está logueado
    if (currentUser && currentUserId) {
        if (sectionId === 'personal-data') {
            loadPersonalData();
        }
        // Para archivos y tiempo real, los listeners ya deberían estar activos
        // si el usuario está logueado, por lo que no se necesita recarga explícita aquí.
    } else {
         console.log("Navegación abortada (o solo visual), usuario no logueado.");
    }
}

// Función para limpiar los datos de todas las secciones (al cerrar sesión)
function clearAllSections() {
     console.log("Limpiando todas las secciones...");
    // Limpiar formulario de datos personales
    if(personalDataForm) personalDataForm.reset();
    if(pdSaveStatus) pdSaveStatus.textContent = '';
    // Limpiar estado de subida y lista de archivos
    if(fileInput) fileInput.value = ''; // Limpiar selección de archivo
    if(uploadStatus) uploadStatus.textContent = '';
    if(fileList) fileList.innerHTML = '';
    // Limpiar formulario y lista de datos en tiempo real
    if(realtimeDataForm) realtimeDataForm.reset();
    if(rtSaveStatus) rtSaveStatus.textContent = '';
    if(realtimeList) realtimeList.innerHTML = '';
}

// -----------------------------------------------------------------------------
// 5. SECCIÓN: DATOS PERSONALES
// -----------------------------------------------------------------------------

// Cargar datos personales existentes
function loadPersonalData() {
    if (!currentUserId) {
        console.log("loadPersonalData: Abortado, no hay usuario logueado.");
        return;
    }
     if (!db) {
         console.error("loadPersonalData: Abortado, servicio DB no disponible.");
         return;
     }

     console.log(`loadPersonalData: Cargando datos para ${currentUserId}`);
    const userProfileRef = db.ref(`users/${currentUserId}/profile`);

    userProfileRef.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                if(pdNombreInput) pdNombreInput.value = data.nombre || '';
                if(pdDireccionInput) pdDireccionInput.value = data.direccion || '';
                if(pdTelefonoInput) pdTelefonoInput.value = data.telefono || '';
                console.log('Datos personales cargados:', data);
            } else {
                console.log('No hay datos personales previos.');
                // Opcional: Limpiar el formulario si no hay datos
                 if(personalDataForm) personalDataForm.reset();
            }
        })
        .catch(error => {
            console.error("Error al cargar datos personales:", error);
            if(pdSaveStatus) {
                pdSaveStatus.textContent = 'Error al cargar datos.';
                pdSaveStatus.style.color = 'red';
            }
        });
}

// Guardar datos personales
if (personalDataForm) {
    personalDataForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar que el formulario recargue la página
        if (!currentUserId) {
             console.warn("Guardar datos personales: Abortado, no hay usuario logueado.");
             if(pdSaveStatus) {
                 pdSaveStatus.textContent = 'Debes iniciar sesión para guardar.';
                 pdSaveStatus.style.color = 'red';
             }
             return;
        }
         if (!db) {
             console.error("Guardar datos personales: Abortado, servicio DB no disponible.");
              if(pdSaveStatus) {
                 pdSaveStatus.textContent = 'Error: Servicio de base de datos no disponible.';
                 pdSaveStatus.style.color = 'red';
             }
             return;
         }

        const userProfileRef = db.ref(`users/${currentUserId}/profile`);
        const dataToSave = {
            // Usar '' como default si el input no existe (aunque no debería pasar)
            nombre: pdNombreInput ? pdNombreInput.value : '',
            direccion: pdDireccionInput ? pdDireccionInput.value : '',
            telefono: pdTelefonoInput ? pdTelefonoInput.value : ''
            // timestamp: firebase.database.ServerValue.TIMESTAMP // Descomentar si se quiere guardar timestamp
        };

        console.log(`Guardando datos personales para ${currentUserId}:`, dataToSave);
        if(pdSaveStatus) {
            pdSaveStatus.textContent = 'Guardando...';
            pdSaveStatus.style.color = 'orange';
        }

        userProfileRef.set(dataToSave)
            .then(() => {
                console.log('Datos personales guardados con éxito.');
                 if(pdSaveStatus) {
                    pdSaveStatus.textContent = '¡Datos guardados correctamente!';
                    pdSaveStatus.style.color = 'green';
                    setTimeout(() => { if(pdSaveStatus) pdSaveStatus.textContent = ''; }, 3000); // Limpiar mensaje
                 }
            })
            .catch((error) => {
                console.error('Error al guardar datos personales:', error);
                if(pdSaveStatus) {
                    pdSaveStatus.textContent = `Error: ${error.message}`;
                    pdSaveStatus.style.color = 'red';
                }
            });
    });
     console.log("Listener para guardar datos personales configurado.");
} else {
     console.error("Error: Formulario de datos personales no encontrado.");
}


// -----------------------------------------------------------------------------
// 6. SECCIÓN: SUBIR ARCHIVOS (CRUD Simplificado: Subir y Listar)
// -----------------------------------------------------------------------------
let selectedFile = null;

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
         // Asegurarse de que e.target y e.target.files existen
        if (e.target && e.target.files && e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                 if(uploadStatus) {
                     uploadStatus.textContent = `Archivo seleccionado: ${selectedFile.name}`;
                     uploadStatus.style.color = '#333';
                 }
                 console.log("Archivo seleccionado:", selectedFile.name, selectedFile.type);
            }
        } else {
            selectedFile = null;
            if(uploadStatus) uploadStatus.textContent = '';
            console.log("Selección de archivo cancelada o input vacío.");
        }
    });
     console.log("Listener para input de archivo configurado.");
} else {
     console.error("Error: Input de archivo no encontrado.");
}

if (uploadButton) {
    uploadButton.addEventListener('click', () => {
        if (!selectedFile) {
             console.warn("Subir archivo: Abortado, no hay archivo seleccionado.");
             if(uploadStatus) {
                uploadStatus.textContent = 'Por favor, selecciona un archivo primero.';
                uploadStatus.style.color = 'red';
             }
            return;
        }
         if (!currentUserId) {
            console.warn("Subir archivo: Abortado, no hay usuario logueado.");
             if(uploadStatus) {
                 uploadStatus.textContent = 'Debes iniciar sesión para subir archivos.';
                 uploadStatus.style.color = 'red';
             }
            return;
         }
         if (!storage || !db) {
              console.error("Subir archivo: Abortado, servicios Storage o DB no disponibles.");
              if(uploadStatus) {
                 uploadStatus.textContent = 'Error: Servicios de Storage/DB no disponibles.';
                 uploadStatus.style.color = 'red';
             }
             return;
         }


        // Crear nombre único para el archivo en Storage
        const filePath = `userFiles/${currentUserId}/${Date.now()}_${selectedFile.name}`;
        const fileRef = storage.ref(filePath);

        console.log(`Iniciando subida a: ${filePath}`);
         if(uploadStatus) {
            uploadStatus.textContent = 'Subiendo archivo... 0%';
            uploadStatus.style.color = 'orange';
         }

        const uploadTask = fileRef.put(selectedFile);

        // Escuchar cambios en el estado de la subida
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progreso de la subida
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                 if(uploadStatus) uploadStatus.textContent = `Subiendo archivo... ${Math.round(progress)}%`;
                console.log('Progreso subida: ' + progress + '%');
            },
            (error) => {
                // Manejo de errores
                console.error('Error al subir archivo:', error);
                if(uploadStatus) {
                    uploadStatus.textContent = `Error al subir: ${error.code}`; // Mostrar código de error
                    uploadStatus.style.color = 'red';
                }
                 // Errores comunes: storage/unauthorized, storage/canceled, storage/unknown
                 alert(`Error al subir el archivo: ${error.message}`);
                 // Limpiar selección en caso de error
                 selectedFile = null;
                 if(fileInput) fileInput.value = '';
            },
            () => {
                // Subida completada con éxito
                 console.log('Archivo subido con éxito a Storage.');
                 if(uploadStatus) {
                    uploadStatus.textContent = '¡Archivo subido correctamente!';
                    uploadStatus.style.color = 'green';
                 }

                // Obtener la URL de descarga
                uploadTask.snapshot.ref.getDownloadURL()
                    .then((downloadURL) => {
                        console.log('URL de descarga obtenida:', downloadURL);

                        // Guardar metadatos del archivo en Realtime Database
                        const fileData = {
                            name: selectedFile.name,
                            url: downloadURL,
                            path: filePath, // Guardar path por si se quiere borrar después
                            size: selectedFile.size, // Guardar tamaño
                            type: selectedFile.type, // Guardar tipo MIME
                            uploadedAt: firebase.database.ServerValue.TIMESTAMP
                        };
                        // Usamos push() para generar una clave única para cada archivo
                        const dbRef = db.ref(`userFiles/${currentUserId}`);
                        dbRef.push(fileData)
                            .then(() => {
                                 console.log("Metadatos del archivo guardados en DB");
                                 // Limpiar después de guardar en DB también
                                 selectedFile = null;
                                 if(fileInput) fileInput.value = '';
                                 if(uploadStatus) setTimeout(() => {if(uploadStatus) uploadStatus.textContent = '';}, 3000);
                             })
                            .catch(err => {
                                console.error("Error al guardar metadatos en DB:", err);
                                // Informar al usuario que la subida fue ok, pero el registro falló
                                if(uploadStatus) {
                                    uploadStatus.textContent = 'Subida OK, pero error registrando archivo.';
                                     uploadStatus.style.color = 'red';
                                }
                                alert("Error al guardar la información del archivo en la base de datos.");
                            });

                    })
                    .catch(err => {
                        console.error("Error al obtener URL de descarga:", err);
                        if(uploadStatus) {
                            uploadStatus.textContent = 'Subida OK, pero error al obtener URL.';
                            uploadStatus.style.color = 'red';
                        }
                        alert("Error al obtener la dirección del archivo subido.");
                         // Limpiar aunque falle la URL
                         selectedFile = null;
                         if(fileInput) fileInput.value = '';
                    });
            }
        );
    });
     console.log("Listener para botón de subida de archivo configurado.");
} else {
    console.error("Error: Botón de subida de archivo no encontrado.");
}


// Configurar listener para mostrar lista de archivos
function setupFileDataListener() {
    if (!currentUserId) {
        console.log("setupFileDataListener: Abortado, no hay usuario.");
        return;
    }
     if (!db) {
         console.error("setupFileDataListener: Abortado, servicio DB no disponible.");
         return;
     }

     console.log(`setupFileDataListener: Configurando listener para archivos de ${currentUserId}`);
    const userFilesRef = db.ref(`userFiles/${currentUserId}`);

    // Remover listener anterior si existe, para evitar duplicados al reloguear
    if (fileDataListener) {
        try {
            userFilesRef.off('value', fileDataListener);
            console.log("Listener de archivos anterior removido.");
        } catch(e){ console.error("Error removiendo listener de archivos anterior:", e); }
    }

    fileDataListener = userFilesRef.orderByChild('uploadedAt').on('value', (snapshot) => { // Ordenar por fecha
        if(!fileList) {
             console.error("Listener de archivos: Elemento fileList no encontrado en el DOM.");
             return;
        }
        fileList.innerHTML = ''; // Limpiar lista actual
        const files = snapshot.val();
        if (files && Object.keys(files).length > 0) {
            console.log('Archivos recibidos de DB:', files);
            // Invertir las claves para mostrar los más nuevos primero
             const fileKeys = Object.keys(files).reverse();

            fileKeys.forEach(fileKey => {
                const fileData = files[fileKey];
                const li = document.createElement('li');

                // Enlace para descargar/ver
                 const link = document.createElement('a');
                 link.href = fileData.url;
                 link.textContent = fileData.name || 'Archivo sin nombre';
                 link.target = '_blank'; // Abrir en nueva pestaña
                 link.rel = 'noopener noreferrer'; // Seguridad para target="_blank"
                 li.appendChild(link);

                 // Mostrar info adicional (opcional)
                 const infoSpan = document.createElement('span');
                 infoSpan.style.fontSize = '0.8em';
                 infoSpan.style.marginLeft = '10px';
                 infoSpan.style.color = '#666';
                 let infoText = '';
                 if(fileData.size) infoText += ` (${~~(fileData.size / 1024)} KB)`; // Tamaño en KB
                 if(fileData.uploadedAt) infoText += ` - ${new Date(fileData.uploadedAt).toLocaleDateString()}`; // Fecha
                 infoSpan.textContent = infoText;
                 li.appendChild(infoSpan);


                // Opcional: Botón para borrar (requiere lógica adicional y confirmación)
                /*
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Borrar';
                deleteButton.style.marginLeft = '10px';
                deleteButton.style.fontSize = '0.8em';
                deleteButton.style.padding = '2px 5px';
                deleteButton.style.backgroundColor = '#dc3545'; // Rojo
                deleteButton.onclick = () => deleteFile(fileKey, fileData.path);
                li.appendChild(deleteButton);
                */

                fileList.appendChild(li);
            });
        } else {
            fileList.innerHTML = '<li>No hay archivos subidos.</li>';
            console.log('No hay archivos en la base de datos para este usuario.');
        }
    }, (error) => {
        console.error("Error al escuchar cambios en archivos:", error);
        if(fileList) fileList.innerHTML = '<li>Error al cargar la lista de archivos.</li>';
    });
     console.log("Listener 'value' para archivos configurado.");
}

// --- Función Opcional para Borrar Archivos (CRUD - Delete) ---
// ...

// -----------------------------------------------------------------------------
// 7. SECCIÓN: DATOS EN TIEMPO REAL
// -----------------------------------------------------------------------------

if (realtimeDataForm) {
    // Guardar nuevo registro en tiempo real
    realtimeDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUserId) {
             console.warn("Guardar RT: Abortado, no hay usuario.");
              if(rtSaveStatus) {
                 rtSaveStatus.textContent = 'Debes iniciar sesión.';
                 rtSaveStatus.style.color = 'red';
             }
             return;
        }
        if (!db) {
             console.error("Guardar RT: Abortado, servicio DB no disponible.");
              if(rtSaveStatus) {
                 rtSaveStatus.textContent = 'Error: DB no disponible.';
                 rtSaveStatus.style.color = 'red';
             }
             return;
        }

        // Asegurarse que los inputs existen antes de leer .value
        const item = rtItemInput ? rtItemInput.value.trim() : '';
        const value = rtValueInput ? rtValueInput.value.trim() : '';

        if (!item || !value) {
             if(rtSaveStatus) {
                rtSaveStatus.textContent = 'Completa ambos campos.';
                rtSaveStatus.style.color = 'red';
             }
            return;
        }

        const realtimeRef = db.ref(`realtimeItems/${currentUserId}`);
        console.log(`Guardando registro RT para ${currentUserId}:`, {item, value});
         if(rtSaveStatus) {
            rtSaveStatus.textContent = 'Guardando...';
            rtSaveStatus.style.color = 'orange';
         }

        // push() genera una clave única para cada registro
        realtimeRef.push({
            item: item,
            value: value,
            createdAt: firebase.database.ServerValue.TIMESTAMP // Guarda la hora del servidor
        })
        .then(() => {
            console.log('Registro en tiempo real guardado.');
            if(rtSaveStatus) {
                rtSaveStatus.textContent = '¡Registro agregado!';
                rtSaveStatus.style.color = 'green';
            }
            if(realtimeDataForm) realtimeDataForm.reset(); // Limpiar formulario
            if(rtSaveStatus) setTimeout(() => { if(rtSaveStatus) rtSaveStatus.textContent = '';}, 3000);
        })
        .catch((error) => {
            console.error('Error al guardar registro en tiempo real:', error);
             if(rtSaveStatus) {
                rtSaveStatus.textContent = `Error: ${error.message}`;
                rtSaveStatus.style.color = 'red';
             }
        });
    });
    console.log("Listener para guardar datos en tiempo real configurado.");
} else {
     console.error("Error: Formulario de datos en tiempo real no encontrado.");
}


// Configurar listener para mostrar datos en tiempo real
function setupRealtimeDataListener() {
    if (!currentUserId) {
         console.log("setupRealtimeDataListener: Abortado, no hay usuario.");
         return;
     }
     if (!db) {
         console.error("setupRealtimeDataListener: Abortado, servicio DB no disponible.");
         return;
     }

     console.log(`setupRealtimeDataListener: Configurando listener para RTDB de ${currentUserId}`);
    const realtimeRef = db.ref(`realtimeItems/${currentUserId}`);

    // Remover listener anterior si existe
    if (realtimeDataListener) {
         try {
            realtimeRef.off('value', realtimeDataListener);
            console.log("Listener RTDB anterior removido.");
         } catch(e) { console.error("Error removiendo listener RTDB anterior:", e); }
    }

    // Escuchar el evento 'value', ordenado por fecha de creación
    realtimeDataListener = realtimeRef.orderByChild('createdAt').on('value', (snapshot) => {
        if(!realtimeList){
             console.error("Listener RTDB: Elemento realtimeList no encontrado en DOM.");
             return;
        }
        realtimeList.innerHTML = ''; // Limpiar lista actual
        const items = snapshot.val();
        if (items && Object.keys(items).length > 0) {
            console.log('Datos en tiempo real recibidos:', items);
            // Invertir claves para mostrar más nuevos primero
            const itemKeys = Object.keys(items).reverse();

            itemKeys.forEach(key => {
                const itemData = items[key];
                const li = document.createElement('li');

                // Contenido principal
                 const contentSpan = document.createElement('span');
                 contentSpan.textContent = `${itemData.item || '?'}: ${itemData.value || '?'}`;
                 li.appendChild(contentSpan);

                 // Opcional: Mostrar timestamp de creación
                 if(itemData.createdAt) {
                     const timestamp = new Date(itemData.createdAt).toLocaleString();
                     const timeSpan = document.createElement('span');
                     timeSpan.textContent = ` (${timestamp})`;
                     timeSpan.style.fontSize = '0.8em';
                     timeSpan.style.color = '#666';
                     timeSpan.style.marginLeft = '10px';
                     li.appendChild(timeSpan);
                 }

                // Opcional: Añadir botón para borrar
                /*
                 const deleteBtn = document.createElement('button');
                 deleteBtn.textContent = 'X';
                 deleteBtn.style.marginLeft = '15px';
                 deleteBtn.style.fontSize = '0.8em';
                 deleteBtn.style.padding = '1px 4px';
                 deleteBtn.style.backgroundColor = '#dc3545';
                 deleteBtn.style.color = 'white';
                 deleteBtn.style.border = 'none';
                 deleteBtn.style.cursor = 'pointer';
                 deleteBtn.setAttribute('aria-label', `Borrar ${itemData.item}`);
                 deleteBtn.onclick = () => deleteRealtimeItem(key);
                 li.appendChild(deleteBtn);
                */

                realtimeList.appendChild(li);
            });
        } else {
            realtimeList.innerHTML = '<li>No hay registros aún.</li>';
            console.log('No hay registros en tiempo real para este usuario.');
        }
    }, (error) => {
        console.error("Error al escuchar datos en tiempo real:", error);
         if(realtimeList) realtimeList.innerHTML = '<li>Error al cargar los registros.</li>';
         // Podría ser un error de permisos (revisar reglas de DB)
    });
     console.log("Listener 'value' para RTDB configurado.");
}

// --- Función Opcional para Borrar Item en Tiempo Real ---
// ...

// -----------------------------------------------------------------------------
// 8. SECCIÓN: INFORMACIÓN DE EMPRESA
// -----------------------------------------------------------------------------

// Manejo del formulario de información de empresa
if (companyInfoForm) {
    companyInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUserId) {
            console.warn("Guardar info empresa: Abortado, no hay usuario.");
            if(ciSaveStatus) {
                ciSaveStatus.textContent = 'Debes iniciar sesión para guardar.';
                ciSaveStatus.style.color = 'red';
            }
            return;
        }

        const companyData = {
            nombre: document.getElementById('ci-nombre').value,
            direccion: document.getElementById('ci-direccion').value,
            email: document.getElementById('ci-email').value,
            empleados: document.getElementById('ci-empleados').value,
            facturacion: document.getElementById('ci-facturacion').value,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        firebase.database().ref('companies/' + currentUserId).set(companyData)
            .then(() => {
                ciSaveStatus.textContent = '¡Información guardada correctamente!';
                ciSaveStatus.style.color = 'green';
                setTimeout(() => {
                    if(ciSaveStatus) ciSaveStatus.textContent = '';
                }, 3000);
            })
            .catch((error) => {
                ciSaveStatus.textContent = `Error: ${error.message}`;
                ciSaveStatus.style.color = 'red';
            });
    });
}

// Función para cargar datos de la empresa
function loadCompanyInfo() {
    if (!currentUserId || !firebase.database()) return;

    firebase.database().ref('companies/' + currentUserId).once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                document.getElementById('ci-nombre').value = data.nombre || '';
                document.getElementById('ci-direccion').value = data.direccion || '';
                document.getElementById('ci-email').value = data.email || '';
                document.getElementById('ci-empleados').value = data.empleados || '';
                document.getElementById('ci-facturacion').value = data.facturacion || '';
            }
        })
        .catch(error => {
            console.error("Error al cargar datos de la empresa:", error);
            ciSaveStatus.textContent = 'Error al cargar datos.';
            ciSaveStatus.style.color = 'red';
        });
}

// -----------------------------------------------------------------------------
// INICIO: Mensaje final de carga del script
// -----------------------------------------------------------------------------
console.log("Script cargado completamente. Esperando eventos...");