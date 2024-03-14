export default function postSurveyFormHindi(unchecked_list, checked_list) {
    let result = [];
    let groups_left = "आपने निम्नलिखित समूह से बाहर निकलने का विकल्प चुना है : </br>"

    if (unchecked_list.length === 0) {
        groups_left += "</br>NONE";
    }
    else {
        for (let i = 0; i < unchecked_list.length; i++) {
            groups_left += "</br> > " + unchecked_list[i];
        }
    }


    let groups_donated = "आपने निम्नलिखित समूह से संदेश साझा करना चुना है : </br>"

    if (checked_list.length === 0) {
        groups_donated += "</br>NONE</br>";
    }
    else {
        for (let i = 0; i < checked_list.length; i++) {
            groups_donated += "</br> > " + checked_list[i]
        }
    }


    let pagecounter = 0

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
            "हमने देखा कि आपने कुछ समूहों को दान से बाहर रखा है। यह ठीक है! जैसा कि हमने आपको बताया, अब हम इन समूहों के डेटा तक नहीं पहुंच सकते। यह समझने के लिए कि आपने हमें क्या दिया, हम यह समझना चाहेंगे कि ये किस प्रकार के समूह हैं..."
    }

    for (let i = 0; i < unchecked_list.length; i++) {
        let jsonObj = [{
            name: "page" + (pagecounter + 2),
            elements: [
                {
                    type: "radiogroup",
                    name: "question2" + "_" + unchecked_list[i],
                    title:
                        "आपने " + unchecked_list[i] + " नामक समूह को बाहर कर दिया.. इस समूह में किस प्रकार के लोग हैं?",
                    isRequired: true,
                    choices: [
                        "ज्यादातर लोग जिन्हें मैं अच्छी तरह से जानता हूं",
                        "ज्यादातर लोग जिन्हें मैं अस्पष्ट रूप से जानता हूं",
                        "ज्यादातर लोग जिन्हें मैं बिल्कुल नहीं जानता"
                    ]
                }
            ],
            title: "आपने निम्नलिखित समूह से बाहर निकलने का विकल्प चुना है : </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 3),
            elements: [
                {
                    type: "radiogroup",
                    name: "question3" + "_" + unchecked_list[i],
                    title: "आप इस समूह के प्रतिभागियों से कैसे संबंधित हैं?",
                    isRequired: true,
                    choices: [
                        "दोस्त",
                        "रिश्तेदार/परिवार",
                        "सहकर्मी",
                        "तत्काल पड़ोसी",
                        "जिस संघ का मैं हिस्सा हूं उसके लोग (उदाहरण के लिए, संघ आदि...)",
                        "एक अनौपचारिक समूह के लोग जिसका मैं हिस्सा हूं",
                        "मैं जिस राजनीतिक दल या राजनीतिक संघ का हिस्सा हूं, उसके लोग"
                    ],
                    showOtherItem: true
                }
            ],
            title: "आपने निम्नलिखित समूह से बाहर निकलने का विकल्प चुना है : </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 4),
            elements: [
                {
                    type: "checkbox",
                    name: "question4" + "_" + unchecked_list[i],
                    title:
                        "निम्नलिखित में से किस प्रकार के संदेश नियमित रूप से " + unchecked_list[i] + " पर पोस्ट किए जाते हैं? [आप जितनी आवश्यकता हो उतने क्लिक कर सकते हैं]?",
                    isRequired: true,
                    choices: [
                        // "समाचार",
                        // "मनोरंजन",
                        // "प्रणाम/शुभकामनाएँ",
                        // "समूह के सदस्यों के बारे में अपडेट",
                        // "व्यावहारिक और तार्किक संदेश",
                        // "विज्ञापन/प्रचार"
                        "समाचार",
                        "मनोरंजन (मजेदार समाचार, चुटकुले, गाने, मजेदार चित्र आदि...)",
                        "प्रणाम एवं शुभकामनाएँ",
                        "समूह के सदस्यों के बारे में अपडेट",
                        "व्यावहारिक और तार्किक संदेश",
                        "कार्य-संबंधी और/या आधिकारिक सामग्री",
                        "विज्ञापन/प्रचार/व्यावसायिक सामग्री",
                        "सामाजिक या राजनीतिक वकालत/प्रचार"
                    ],
                    showOtherItem: true
                }
            ],
            title: "आपने निम्नलिखित समूह से बाहर निकलने का विकल्प चुना है : </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 5),
            elements: [
                {
                    type: "radiogroup",
                    name: "question5" + "_" + unchecked_list[i],
                    title:
                        "आप " + unchecked_list[i] + " पर पोस्ट की गई सामग्री से कितना जुड़ते हैं या उस पर कितना ध्यान देते हैं?",
                    isRequired: true,
                    choices: [
                        "बहुत अधिक ध्यान - मैं लगभग हमेशा इसे देखता हूँ",
                        "कुछ ध्यान - मैं कभी-कभी इसे देखता हूं, कभी-कभी अनदेखा कर देता हूं।",
                        "बिल्कुल ध्यान नहीं - मैं इसे कभी नहीं देखता।"
                    ]
                }
            ],
            title: "आपने निम्नलिखित समूह से बाहर निकलने का विकल्प चुना है : </br>" + unchecked_list[i]
        }]

        for (let p = 1; p < 5; p++) {
            result[pagecounter + p] = jsonObj[p - 1]
        }
        pagecounter = pagecounter + 4;

    }

    for (let i = 0; i < checked_list.length; i++) {
        let jsonObj = [{
            name: "page" + (pagecounter + 2),
            elements: [
                {
                    type: "radiogroup",
                    name: "checked_question2" + "_" + checked_list[i],
                    title:
                        "आपने " + checked_list[i] + "इस समूह में किस प्रकार के लोग हैं?",
                    isRequired: true,
                    choices: [
                        "ज्यादातर लोग जिन्हें मैं अच्छी तरह से जानता हूं",
                        "ज्यादातर लोग जिन्हें मैं अस्पष्ट रूप से जानता हूं",
                        "ज्यादातर लोग जिन्हें मैं बिल्कुल नहीं जानता"
                    ]
                }
            ],
            title: "आप निम्नलिखित समूह से संदेश साझा करने के लिए सहमत हुए: </br>" + checked_list[i]

        },
        {
            name: "page" + (pagecounter + 3),
            elements: [
                {
                    type: "radiogroup",
                    name: "checked_question3" + "_" + checked_list[i],
                    title: "आप इस समूह के प्रतिभागियों से कैसे संबंधित हैं?",
                    isRequired: true,
                    choices: [
                        "दोस्त",
                        "रिश्तेदार/परिवार",
                        "सहकर्मी",
                        "तत्काल पड़ोसी",
                        "जिस संघ का मैं हिस्सा हूं उसके लोग (उदाहरण के लिए, संघ आदि...)",
                        "एक अनौपचारिक समूह के लोग जिसका मैं हिस्सा हूं",
                        "मैं जिस राजनीतिक दल या राजनीतिक संघ का हिस्सा हूं, उसके लोग"
                    ],
                    showOtherItem: true
                }
            ],
            title: "आप निम्नलिखित समूह से संदेश साझा करने के लिए सहमत हुए: </br>" + checked_list[i]

        },
        {
            name: "page" + (pagecounter + 4),
            elements: [
                {
                    type: "checkbox",
                    name: "checked_question4" + "_" + checked_list[i],
                    title:
                        "निम्नलिखित में से किस प्रकार के संदेश नियमित रूप से " + checked_list[i] + " पर पोस्ट किए जाते हैं? [आप जितनी आवश्यकता हो उतने क्लिक कर सकते हैं]?",
                    isRequired: true,
                    choices: [
                        // "समाचार",
                        // "मनोरंजन",
                        // "प्रणाम/शुभकामनाएँ",
                        // "समूह के सदस्यों के बारे में अपडेट",
                        // "व्यावहारिक और तार्किक संदेश",
                        // "विज्ञापन/प्रचार"
                        "समाचार",
                        "मनोरंजन (मजेदार समाचार, चुटकुले, गाने, मजेदार चित्र आदि...)",
                        "प्रणाम एवं शुभकामनाएँ",
                        "समूह के सदस्यों के बारे में अपडेट",
                        "व्यावहारिक और तार्किक संदेश",
                        "कार्य-संबंधी और/या आधिकारिक सामग्री",
                        "विज्ञापन/प्रचार/व्यावसायिक सामग्री",
                        "सामाजिक या राजनीतिक वकालत/प्रचार"
                    ],
                    showOtherItem: true
                }
            ],
            title: "आप निम्नलिखित समूह से संदेश साझा करने के लिए सहमत हुए: </br>" + checked_list[i]
        },
        {
            name: "page" + (pagecounter + 5),
            elements: [
                {
                    type: "radiogroup",
                    name: "checked_question5" + "_" + checked_list[i],
                    title:
                        "आप " + checked_list[i] + " पर पोस्ट की गई सामग्री से कितना जुड़ते हैं या उस पर कितना ध्यान देते हैं?",
                    isRequired: true,
                    choices: [
                        "बहुत अधिक ध्यान - मैं लगभग हमेशा इसे देखता हूँ",
                        "कुछ ध्यान - मैं कभी-कभी इसे देखता हूं, कभी-कभी अनदेखा कर देता हूं।",
                        "बिल्कुल ध्यान नहीं - मैं इसे कभी नहीं देखता।"
                    ]
                }
            ],
            title: "आप निम्नलिखित समूह से संदेश साझा करने के लिए सहमत हुए: </br>" + checked_list[i]
        }]

        for (let p = 1; p < 5; p++) {
            result[pagecounter + p] = jsonObj[p - 1]
        }
        pagecounter = pagecounter + 4;
    }

    result[pagecounter + 1] = {
        name: "post-survey-page-5",
        elements: [
            {
                "type": "matrix",
                "name": "Politician Support",
                "title": "मूल्यांकन करें कि आप निम्नलिखित राजनेताओं का किस हद तक समर्थन करते हैं :",
                "isRequired": true,
                "columns": [
                    "पूर्ण समर्थन",
                    "समर्थन",
                    "ख़िलाफ़",
                    "सख्त खिलाफ"
                ],
                "rows": [
                    "प्रधानमंत्री मोदी",
                    "सी.एम. योगी आदित्यनाथ"
                ]
            },
            {
                "type": "matrix",
                "name": "Political Party Supoort",
                "title": "आप इनमें से प्रत्येक पार्टी के कितने करीब हैं ?",
                "isRequired": true,
                "columns": [
                    "बहुत दूर",
                    "दूर",
                    "करीब",
                    "बहुत करीब"
                ],
                "rows": [
                    "बी.जे.पी",
                    "INC",
                    "SP",
                    "BSP",
                    "RLD",
                    "अपना दल"
                ]
            }
        ]
    }
    let surveyForm = {
        "progressBarType": "pages",
        "showProgressBar": "top",
        logoPosition: "right",
        pages: result
    };
    return JSON.stringify(surveyForm);
}