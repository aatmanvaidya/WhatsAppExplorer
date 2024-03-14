export default function postSurveyFormEs(unchecked_list, checked_list) {
    let result = [];
    let groups_left = "Notamos que has excluido algunos grupos de tu donación de datos. ¡No hay ningún problema! </br></br> Has desmarcado los siguientes grupos: </br>";

    if (unchecked_list.length === 0) {
        groups_left += "</br>NINGUNO";
    } else {
        for (let i = 0; i < unchecked_list.length; i++) {
            groups_left += "</br> > " + unchecked_list[i];
        }
    }

    let groups_donated = "Has elegido los siguientes grupos: </br>";

    if (checked_list.length === 0) {
        groups_donated += "</br>NINGUNO</br>";
    } else {
        for (let i = 0; i < checked_list.length; i++) {
            groups_donated += "</br> > " + checked_list[i];
        }
    }

    result[0] = {
        name: "page1",
        elements: [{
            type: "radiogroup",
            name: "question1",
            title: groups_left + " </br></br>y " + groups_donated,
        }],
        description: "Para entender mejor lo donado, nos gustaría saber más sobre qué son estos grupos...",
    };

    for (let i = 0; i < unchecked_list.length; i++) {
        result.push({
                name: "page" + (2 * i + 2),
                elements: [{
                    type: "radiogroup",
                    name: "question2_" + unchecked_list[i],
                    title: "Has elegido dejar el grupo " + unchecked_list[i] + ". ¿Qué tipos de personas hay en este grupo?",
                    isRequired: true,
                    choices: [
                        "Conozco bien a las personas del grupo",
                        "Conozco poco a las personas del grupo",
                        "No conozco a las personas del grupo",
                    ],
                }, ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [{
                    type: "radiogroup",
                    name: "question3_" + unchecked_list[i],
                    title: "¿Cómo clasificarías tu relación con las personas de este grupo?",
                    isRequired: true,
                    choices: [
                        "Amigos",
                        "Familiares",
                        "Compañeros de trabajo",
                        "Vecinos",
                        "Personas de una organización a la que pertenezco (por ejemplo, sindicato, ONG, etc.)",
                        "Personas de un partido político o organización política a la que pertenezco",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [{
                    type: "checkbox",
                    name: "question4_" + unchecked_list[i],
                    title: "¿Qué tipo de mensajes se publican con frecuencia en el grupo " +
                        unchecked_list[i] +
                        "? Puedes seleccionar tantas categorías como desees",
                    isRequired: true,
                    choices: [
                        "Noticias",
                        "Entretenimiento (noticias divertidas, chistes, videos e imágenes graciosas, música y clips, personas bailando, etc.)",
                        "Personas felicitando a miembros",
                        "Actualizaciones sobre miembros del grupo",
                        "Mensajes y materiales de trabajo",
                        "Promociones o materiales comerciales",
                        "Contenido político (propaganda de partidos, candidatos, memes sobre políticos, etc.)",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [{
                    type: "radiogroup",
                    name: "question5_" + unchecked_list[i],
                    title: "¿Cuánto interactúas y prestas atención a lo que se publica en el grupo " +
                        unchecked_list[i] +
                        "?",
                    isRequired: true,
                    choices: [
                        "Mucha atención (casi siempre veo)",
                        "Alguna atención (a veces veo, a veces ignoro)",
                        "No presto atención (nunca veo el grupo)",
                    ],
                }, ],
            }
        );
    }

    for (let i = 0; i < checked_list.length; i++) {
        result.push({
                name: "page" + (2 * i + 2),
                elements: [{
                    type: "radiogroup",
                    name: "checked_question2_" + checked_list[i],
                    title: "Has elegido donar información del grupo " + checked_list[i] + ". ¿Qué tan bien conoces a las personas que hay en este grupo?",
                    isRequired: true,
                    choices: [
                        "Conozco bien a las personas del grupo",
                        "Conozco poco a las personas del grupo",
                        "No conozco a las personas del grupo",
                    ],
                }, ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [{
                    type: "radiogroup",
                    name: "checked_question3_" + checked_list[i],
                    title: "¿Cómo clasificarías tu relación con las personas de este grupo?",
                    isRequired: true,
                    choices: [
                        "Amigos",
                        "Familiares",
                        "Compañeros de trabajo",
                        "Vecinos",
                        "Personas de una organización a la que pertenezco (por ejemplo, sindicato, ONG, etc.)",
                        "Personas de un partido político o organización política a la que pertenezco",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [{
                    type: "checkbox",
                    name: "checked_question4_" + checked_list[i],
                    title: "¿Qué tipo de mensajes se publican con frecuencia en el grupo " +
                        checked_list[i] +
                        "? Puedes seleccionar tantas categorías como desees",
                    isRequired: true,
                    choices: [
                        "Noticias",
                        "Entretenimiento (noticias divertidas, chistes, videos e imágenes graciosas, música y clips, personas bailando, etc.)",
                        "Personas felicitando a miembros",
                        "Actualizaciones sobre miembros del grupo",
                        "Mensajes y materiales de trabajo",
                        "Promociones o materiales comerciales",
                        "Contenido político (propaganda de partidos, candidatos, memes sobre políticos, etc.)",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [{
                    type: "radiogroup",
                    name: "checked_question5_" + checked_list[i],
                    title: "¿Cuánto interactúas y prestas atención a lo que se publica en el grupo " +
                        checked_list[i] +
                        "?",
                    isRequired: true,
                    choices: [
                        "Mucha atención (casi siempre veo)",
                        "Alguna atención (a veces veo, a veces ignoro)",
                        "No presto atención (nunca veo el grupo)",
                    ],
                }, ],
            }
        );
    }

    let surveyForm = {
        progressBarType: "pages",
        showProgressBar: "top",
        logoPosition: "right",
        pages: result,
    };

    return JSON.stringify(surveyForm);
}
