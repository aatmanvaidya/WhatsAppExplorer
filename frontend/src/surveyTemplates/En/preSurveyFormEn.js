export default function preSurveyJsonEn() {
    let result = [{
        name: "post-survey-page-1",
        elements: [{
                "type": "text",
                "name": "age",
                "title": "What is your age?",
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
                "title": "What is your gender?",
                "isRequired": true,
                "choices": [
                    "Male",
                    "Female",
                ]
            }
        ]
    },
    {
        name: "post-survey-page-2",
        elements: [{
                "type": "radiogroup",
                "name": "race",
                "title": "What is your race?",
                "isRequired": true,
                "choices": [
                    "White",
                    "Brown",
                    "Black",
                    "Yellow",
                    "Indigenous",
                ]
            },
            {
                "type": "radiogroup",
                "name": "religion",
                "title": "What is your religion?",
                "isRequired": true,
                "choices": [
                    "Catholic",
                    "Evangelical",
                    "Believer without religion",
                    "Another religion",
                    "Agnostic or atheist"
                ]
            }
        ]
    },
    {
        name: "post-survey-page-3",
        elements: [{
                "type": "radiogroup",
                "name": "education",
                "title": "What is your level of education?",
                "isRequired": true,
                "choices": [
                    "Elementary School",
                    "High School",
                    "Higher Education",
                    "Other",
                ]
            },
            {
                "type": "text",
                "name": "zip",
                "title": "What is the ZIP code of your residence?",
                "isRequired": true,
                "inputType": "number",
                "min": 10000,
                "minErrorText": "Please enter a valid ZIP code with at least 5 digits.",
            },
        ]
    },
    {
        name: "post-survey-page-4",
        elements: [{
                "type": "radiogroup",
                "name": "Monthly Income",
                "title": "What is your family's monthly income?",
                "isRequired": true,
                "choices": [
                    "$0-$2,000",
                    "$2,000-$3,000",
                    "$3,000-$5,000",
                    "$5,000-$10,000",
                    "Above $10,000"
                ]
            },
            {
                "type": "radiogroup",
                "name": "Resources",
                "title": "Does your family receive money from the Bolsa Família program?",
                "isRequired": true,
                "choices": [
                    "Yes",
                    "No"
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
