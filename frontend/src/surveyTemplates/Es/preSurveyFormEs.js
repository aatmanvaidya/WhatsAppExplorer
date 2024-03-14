export default function preSurveyJsonEs() {
    let result = [{
            name: "post-survey-page-1",
            elements: [{
                    "type": "text",
                    "name": "age",
                    "title": "¿Cuál es su edad?",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0,
                    "max": 100,
                    "minErrorText": "Rango de entrada: 0 - 100",
                    "maxErrorText": "Rango de entrada: 0 - 100"
                },
                {
                    "type": "radiogroup",
                    "name": "gender",
                    "title": "¿Cuál es su género?",
                    "isRequired": true,
                    "choices": [
                        "Hombre",
                        "Mujer",
                    ]
                }
            ]
        },
        {
            name: "post-survey-page-2",
            elements: [{
                    "type": "radiogroup",
                    "name": "race",
                    "title": "De acuerdo con su cultura o rasgos físicos ¿Cuál es su raza?:",
                    "isRequired": true,
                    "choices": [
                        "Negro/Afro",
                        "Indigena",
                        "Blanco",
                        "Mestizo",
                        "Otro",
                    ]
                },
                {
                    "type": "radiogroup",
                    "name": "religion",
                    "title": "¿Cuál es tu religión?",
                    "isRequired": true,
                    "choices": [
                        "Católico",
                        "Evangélico",
                        "Creencia sin religión",
                        "Otra religión",
                        "Agnóstico o ateo"
                    ]
                }
            ]
        },
        {
            name: "post-survey-page-3",
            elements: [{
                    "type": "radiogroup",
                    "name": "education",
                    "title": "¿Cuál es tu nivel de educación?",
                    "isRequired": true,
                    "choices": [
                        "Educación primaria",
                        "Educación secundaria",
                        "Educación superior",
                        "Otro",
                    ]
                },
                {
                    "type": "text",
                    "name": "zip",
                    "title": "¿Cuál es el código postal de tu residencia?",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 10000,
                    "minErrorText": "Por favor, introduce un código postal válido con al menos 5 dígitos.",
                },
            ]
        },
        {
            name: "post-survey-page-4",
            elements: [{
                    "type": "radiogroup",
                    "name": "Monthly Income",
                    "title": "¿Cuál es el ingreso mensual de tu familia?",
                    "isRequired": true,
                    "choices": [
                        "$0 - $1.500.000",
                        "$1.500.000 - $3.000.000",
                        "$3.000.000 - $5.000.000",
                        "$5.000.000 - $10.000.000",
                        "Más de $10.000.000"
                    ]
                },
            ]
        }
    ]

    let preSurveyForm = {
        "progressBarType": "pages",
        "showProgressBar": "top",
        logoPosition: "right",
        pages: result
    };
    return JSON.stringify(preSurveyForm);
}
