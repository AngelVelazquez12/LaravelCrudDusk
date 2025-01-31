// Validación Vacío
function validacionVacio(data){
    let cont = 0;
    for (const [key, value] of Object.entries(data)) {
        cont += vacio(key, value);
        if(cont){
            break;
        }
    }
    return (cont > 0)? 0: 1;
}

// Data Table Reportes
const initPokemonTable = async () => {
    $("#reportsTable").DataTable({
        order: [[0, "desc"]],
        info: false,
        searching: false,
        lengthChange: false,
        ordering: false,
        pageLength: 8,
        ajax: {
            url: route("pokemon"),
            type: "GET",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
                Accept: "application/json",
            },
        },
        columns: [
            {
                data: "nombre",
                defaultContent: "Sin nombre",
            },
            {
                data: "tipo",
                defaultContent: "Sin tipo",
            },
            {
                data: "region",
                defaultContent: "Sin nombre",
            },
            {
                data: "nivel"
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button title="Editar" class="open-modal-edit-btn" data-id="${data.id}" data-nombre="${data.nombre}" data-tipo="${data.tipo}" data-region="${data.region}" data-nivel="${data.nivel}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button title="Eliminar" class="open-modal-delete-btn" onclick="eliminarPokemon(${data.id});"><i class="fa-solid fa-trash"></i></button>
                    `;
                },
                orderable: false,
                className: "text-center",
            },
        ],
        dom: "tip",
        language: {
            url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json",
        },
    });
};

$(document).ready(() => {
    initPokemonTable();
});

// Token
const getToken = () => document.querySelector('meta[name="csrf-token"]').getAttribute("content");


// Crear Pokemon
async function createPokemon() {
    const data = {
        nombre: document.getElementById("pokemonName").value.trim(),
        tipo: document
            .getElementById("pokemonType")
            .value.trim(),
        region: document.getElementById("pokemonRegion").value,
        nivel: document.getElementById("pokemonLevel").value,
    };

        try {
            const url = route("pokemonCreate");
            const token = getToken();
            const init = {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            };
            let req = await fetch(url, init);

            if (req.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Pokemon Creado",
                    showConfirmButton: false,
                    timer: 1500,
                });
                location.replace(route("pokemonShow"));
            } else {
                Swal.fire({
                    icon: "error",
                    title: "No se pudo crear el Pokemon.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: "Error en la solicitud",
                text: e.message,
                showConfirmButton: false,
                timer: 1500,
            });
        }

}

document
    .querySelector("#createPokemonForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        createPokemon();
    });


// Eliminar Pokemón
async function eliminarPokemon(id) {
    Swal.fire({
        icon: "question",
        title: "¿Desea Eliminar este Pokemón?",
        confirmButtonText: "Continuar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const url = route("pokemonDelete", id);
            const token = getToken();
            const init = {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            };

            let req = await fetch(url, init);
            if (req.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Pokemón eliminado con éxito.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                location.reload();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error al eliminar Pokemón.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        }
    });
}


// Abrir el Modal con los datos del Pokémon a editar
$(document).on("click", ".open-modal-edit-btn", function () {
    const pokemonId = $(this).data("id");
    const pokemonName = $(this).data("nombre");
    const pokemonType = $(this).data("tipo");
    const pokemonRegion = $(this).data("region");
    const pokemonLevel = $(this).data("nivel");

    $("#editPokemonId").val(pokemonId);
    $("#editPokemonName").val(pokemonName);
    $("#editPokemonType").val(pokemonType);
    $("#editPokemonRegion").val(pokemonRegion);
    $("#editPokemonLevel").val(pokemonLevel);

    $("#editPokemonModal").modal("show");
});

// Editar Pokémon
async function updatePokemon() {
    const id = $("#editPokemonId").val();
    const url = route("pokemonUpdate", id);
    const token = getToken();
    const data = {
        nombre: $("#editPokemonName").val(),
        tipo: $("#editPokemonType").val(),
        region: $("#editPokemonRegion").val(),
        nivel: $("#editPokemonLevel").val(),
    };

    const init = {
        method: "POST",
        headers: {
            "X-CSRF-TOKEN": token,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    try {
        let response = await fetch(url, init);
        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Pokemón actualizado con éxito.",
                showConfirmButton: false,
                timer: 1500,
            });
            location.reload();
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar el Pokemón.",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error de red.",
            showConfirmButton: false,
            timer: 1500,
        });
    }
}

// Envío Editar Pokémon
document
    .querySelector("#editPokemonForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        updatePokemon();
    });
