export default function postSurveyFormPt(unchecked_list, checked_list) {
    let result = [];
    let groups_left = "Notamos que você excluiu alguns grupos da sua doação de dados. Não há problema nenhum! </br></br> Você desmarcou os seguintes grupos: </br>";

    if (unchecked_list.length === 0) {
        groups_left += "</br>NONE";
    } else {
        for (let i = 0; i < unchecked_list.length; i++) {
            groups_left += "</br> > " + unchecked_list[i];
        }
    }

    let groups_donated = "Você escolheu os seguintes grupos: </br>";

    if (checked_list.length === 0) {
        groups_donated += "</br>NONE</br>";
    } else {
        for (let i = 0; i < checked_list.length; i++) {
            groups_donated += "</br> > " + checked_list[i];
        }
    }

    result[0] = {
        name: "page1",
        elements: [
            {
                type: "radiogroup",
                name: "question1",
                title: groups_left + " </br></br>and " + groups_donated,
            }
        ],
        description:
            "Para entender melhor o que foi doado, gostaríamos de saber mais sobre o que são esses grupos...",
    };

    for (let i = 0; i < unchecked_list.length; i++) {
        result.push(
            {
                name: "page" + (2 * i + 2),
                elements: [
                    {
                        type: "radiogroup",
                        name: "question2_" + unchecked_list[i],
                        title:
                            "Você escolheu deixar o grupo " + unchecked_list[i] + ". Que tipos de pessoas estão nesse grupo?",
                        isRequired: true,
                        choices: [
                            "Eu conheço bem as pessoas do grupo",
                            "Eu conheço pouco as pessoas do grupo",
                            "Eu não conheço as pessoas do grupo",
                        ],
                    },
                ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [
                    {
                        type: "radiogroup",
                        name: "question3_" + unchecked_list[i],
                        title: "Como você classificaria sua relação com as pessoas desse grupo?",
                        isRequired: true,
                        choices: [
                            "Amigos",
                            "Familiares",
                            "Colegas de trabalho",
                            "Vizinhos",
                            "Pessoas de uma organização da qual faço parte (ex: sindicato, ONGs, etc)",
                            "Pessoas de um partido político ou organização política de qual faço parte",
                        ],
                        showOtherItem: true,
                    },
                ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [
                    {
                        type: "checkbox",
                        name: "question4_" + unchecked_list[i],
                        title:
                            "Que tipo de mensagens são postadas com frequência no grupo " +
                            unchecked_list[i] +
                            "? Você pode selecionar quantas categorias quiser",
                        isRequired: true,
                        choices: [
                            "Notícias",
                            "Entretenimento (notícias engraçadas, piadas, vídeos e imagens engraçadas, músicas e clipes, pessoas dançando etc…)",
                            "Pessoas dando parabéns para membros",
                            "Atualizações sobre membros do grupo",
                            "Mensagens e materiais de trabalho",
                            "Promoções ou materiais comerciais",
                            "Conteúdo de política (propaganda de partidos, candidatos, memes sobre políticos,)",
                        ],
                        showOtherItem: true,
                    },
                ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [
                    {
                        type: "radiogroup",
                        name: "question5_" + unchecked_list[i],
                        title:
                            "Quanto você interage e presta atenção ao que é postado no grupo " +
                            unchecked_list[i] +
                            "?",
                        isRequired: true,
                        choices: [
                            "Muita atenção (eu quase sempre vejo)",
                            "Alguma atenção (algumas vezes eu vejo, algumas vezes eu ignoro)",
                            "Não presto atenção (eu nunca olho o grupo)",
                        ],
                    },
                ],
            }
        );
    }

    for (let i = 0; i < checked_list.length; i++) {
        result.push(
            {
                name: "page" + (2 * i + 2),
                elements: [
                    {
                        type: "radiogroup",
                        name: "checked_question2_" + checked_list[i],
                        title:
                            "Você escolheu participar do grupo " + checked_list[i] + ". Que tipos de pessoas estão nesse grupo?",
                        isRequired: true,
                        choices: [
                            "Eu conheço bem as pessoas do grupo",
                            "Eu conheço pouco as pessoas do grupo",
                            "Eu não conheço as pessoas do grupo",
                        ],
                    },
                ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [
                    {
                        type: "radiogroup",
                        name: "checked_question3_" + checked_list[i],
                        title: "Como você classificaria sua relação com as pessoas desse grupo?",
                        isRequired: true,
                        choices: [
                            "Amigos",
                            "Familiares",
                            "Colegas de trabalho",
                            "Vizinhos",
                            "Pessoas de uma organização da qual faço parte (ex: sindicato, ONGs, etc)",
                            "Pessoas de um partido político ou organização política de qual faço parte",
                        ],
                        showOtherItem: true,
                    },
                ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [
                    {
                        type: "checkbox",
                        name: "checked_question4_" + checked_list[i],
                        title:
                            "Que tipo de mensagens são postadas com frequência no grupo " +
                            checked_list[i] +
                            "? Você pode selecionar quantas categorias quiser",
                        isRequired: true,
                        choices: [
                            "Notícias",
                            "Entretenimento (notícias engraçadas, piadas, vídeos e imagens engraçadas, músicas e clipes, pessoas dançando etc…)",
                            "Pessoas dando parabéns para membros",
                            "Atualizações sobre membros do grupo",
                            "Mensagens e materiais de trabalho",
                            "Promoções ou materiais comerciais",
                            "Conteúdo de política (propaganda de partidos, candidatos, memes sobre políticos,)",
                        ],
                        showOtherItem: true,
                    },
                ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [
                    {
                        type: "radiogroup",
                        name: "checked_question5_" + checked_list[i],
                        title:
                            "Quanto você interage e presta atenção ao que é postado no grupo " +
                            checked_list[i] +
                            "?",
                        isRequired: true,
                        choices: [
                            "Muita atenção (eu quase sempre vejo)",
                            "Alguma atenção (algumas vezes eu vejo, algumas vezes eu ignoro)",
                            "Não presto atenção (eu nunca olho o grupo)",
                        ],
                    },
                ],
            }
        );
    }

    result.push({
        name: "post-survey-page-5",
        elements: [
            {
                type: "radiogroup",
                name: "PoliticalPartySupport",
                title: "Você acredita que existe algum partido político que representa a maneira como você pensa?",
                isRequired: true,
                choices: [
                    "Sim",
                    "Não",
                ],
            },
            {
                type: "radiogroup",
                name: "PoliticianParty",
                title: "Se a resposta for sim, qual partido político representa melhor a maneira como você pensa?",
                visibleIf: "{PoliticalPartySupport} = 'Sim'",
                isRequired: true,
                choices: [
                    "MDB - Movimento Democrático Brasileiro",
                    "PSDB - Partido da Social Democracia Brasileira",
                    "NOVO",
                    "Republicanos",
                    "União Brasil",
                    "PDT - Partido Democrático Trabalhista",
                    "PL - Partido Liberal",
                    "PSOL - Partido Socialismo e Liberdade",
                    "PT - Partido dos Trabalhadores",
                    "PSB - Partido Socialista Brasileiro",
                    "PSD - Partido Social Democrático",
                ],
            },
        ],
    });

    result.push({
        name: "post-survey-page-6",
        elements: [
            {
                type: "radiogroup",
                name: "DislikeParty",
                title: "Existe algum partido que você não gosta?",
                isRequired: true,
                choices: [
                    "Sim",
                    "Não",
                ],
            },
            {
                type: "radiogroup",
                name: "DislikedParty",
                title: "Se a resposta for sim, de qual partido você menos gosta?",
                visibleIf: "{DislikeParty} = 'Sim'",
                isRequired: true,
                choices: [
                    "MDB - Movimento Democrático Brasileiro",
                    "PSDB - Partido da Social Democracia Brasileira",
                    "NOVO",
                    "Republicanos",
                    "União Brasil",
                    "PDT - Partido Democrático Trabalhista",
                    "PL - Partido Liberal",
                    "PSOL - Partido Socialismo e Liberdade",
                    "PT - Partido dos Trabalhadores",
                    "PSB - Partido Socialista Brasileiro",
                    "PSD - Partido Social Democrático",
                ],
            },
        ],
    });

    let surveyForm = {
        progressBarType: "pages",
        showProgressBar: "top",
        logoPosition: "right",
        pages: result,
    };

    return JSON.stringify(surveyForm);
}
