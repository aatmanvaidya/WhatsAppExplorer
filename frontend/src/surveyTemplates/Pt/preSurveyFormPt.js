export default function preSurveyJsonPt() {
    let result = [{
        name: "post-survey-page-1",
        elements: [
            {
                "type": "text",
                "name": "age",
                "title": "Qual é a sua idade?",
                "isRequired": true,
                "inputType": "number",
                "min": 0,
                "max": 100,
                "minErrorText": "Input range: 0 - 100",
                "maxErrorText": "Input range: 0 - 100"
            },
            {
                "type": "radiogroup",
                "name": "gender",
                "title": "Qual é o seu gênero?",
                "isRequired": true,
                "choices": [
                    "Homem",
                    "Mulher",
                ]
            }
        ]
    },
    {
        name: "post-survey-page-2",
        elements: [
            {
                "type": "radiogroup",
                "name": "race",
                "title": "Qual é a sua raça?",
                "isRequired": true,
                "choices": [
                    "Branca",
                    "Parda",
                    "Preta",
                    "Amarela",
                    "Indígena",
                ]
            },
            {
                "type": "radiogroup",
                "name": "religion",
                "title": "Qual é a sua religião?",
                "isRequired": true,
                "choices": [
                    "Católico",
                    "Evangélico",
                    "Crente sem religião",
                    "Outra religião",
                    "Agnóstico ou ateu"
                ]
            }
        ]
    },
    {
        name: "post-survey-page-3",
        elements: [
            {
                "type": "radiogroup",
                "name": "education",
                "title": "Qual é o seu grau de instrução?",
                "isRequired": true,
                "choices": [
                    "Ensino Fundamental",
                    "Ensino Médio",
                    "Ensino Superior",
                    "Outro",
                ]
            },
            {
                "type": "text",
                "name": "zip",
                "title": "Qual o CEP da sua residência?",
                "isRequired": true,
                "inputType": "number",
                "min": 10000,
                "minErrorText": "Por favor, insira um CEP válido com pelo menos 5 dígitos.",
            },
        ]
    },
    {
        name: "post-survey-page-4",
        elements: [
            {
                "type": "radiogroup",
                "name": "Monthly Income",
                "title": "Qual é a renda mensal da sua família?",
                "isRequired": true,
                "choices": [
                    "R$0-R$2,000",
                    "R$2,000-R$3,000",
                    "R$3,000-R$5,000",
                    "R$5,000-R$10,000",
                    "Acima de R$10,000"
                ]
            },
            {
                "type": "radiogroup",
                "name": "Resources",
                "title": "A sua família recebe dinheiro da Bolsa Família?",
                "isRequired": true,
                "choices": [
                    "Sim",
                    "Não"
                ]
            }
        ]
    }]

    let preSurveyForm = {
        "progressBarType": "pages",
        "showProgressBar": "top",
        logoPosition: "right",
        pages: result
    };
    return JSON.stringify(preSurveyForm);
}