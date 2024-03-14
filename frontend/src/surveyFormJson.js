export default function listToJson(unchecked_list, checked_list) {
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
                    name: "question2" + "_" + (unchecked_list[i]),
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
                        "आपने " + checked_list[i] + " नामक समूह को बाहर कर दिया.. इस समूह में किस प्रकार के लोग हैं?",
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
                        "समाचार",
                        "मनोरंजन",
                        "प्रणाम/शुभकामनाएँ",
                        "समूह के सदस्यों के बारे में अपडेट",
                        "व्यावहारिक और तार्किक संदेश",
                        "विज्ञापन/प्रचार"
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
        name: "post-survey-page-1",
        elements: [
            {
                "type": "text",
                "name": "survey_question1",
                "title": "आपका उम्र क्या है ?",
                "inputType": "number",
                "min": 0,
                "max": 100,
                "minErrorText": "Input range: 0 - 100",
                "maxErrorText": "Input range: 0 - 100"
            },
            {
                "type": "radiogroup",
                "name": "nps_score",
                "title": "आपका धर्म क्या है ?",
                "isRequired": true,
                "choices": [
                    "हिन्दू धर्म",
                    "इस्लाम",
                    "ईसाई धर्म",
                    "सिख धर्म",
                    "बुद्ध धर्म",
                    "जैन धर्म",
                    "असंबद्ध",
                    {
                        "value": "other_religion",
                        "text": "अन्य"
                    }
                ]
            }
        ]
    }
    result[pagecounter + 2] = {
        name: "post-survey-page-2",
        elements: [
            {
                "type": "radiogroup",
                "name": "survey_question2",
                "title": "आप निम्नलिखित में से किस जाति वर्ग से सम्बोधित हैं ?",
                "isRequired": true,
                "choices": [
                    "जनरल/उच्च",
                    "ओ.बी.सी (अन्य पिछड़ा वर्ग)",
                    "दलित/अनुसूचित जाति",
                    "आदिवासी/अनुसूचित जनजाति ",
                    "गैर-हिंदू",
                ]
            },
            {
                "type": "radiogroup",
                "name": "survey_question3",
                "title": "आपकी शिक्षा का उच्चतम स्तर क्या है ?",
                "isRequired": true,
                "choices": [
                    "प्राथमिक विद्यालय (5वीं कक्षा तक)",
                    "माध्यमिक विद्यालय (5-9वीं कक्षा)",
                    "10वीं कक्षा उत्तीर्ण",
                    "12वीं कक्षा उत्तीर्ण",
                    "व्यवसायिक कॉलेज शिक्षा (जैसे इलेक्ट्रीशियन, नर्स के रूप में अर्हता प्राप्त करना)",
                    "विश्वविद्यालय की पहली डिग्री (जैसे बी.ए, बी.एस.सी)",
                    "विश्वविद्यालय की उच्च डिग्री (जैसे एम.ए., एम.बीए., पी.एच.डी)",
                    "व्यवसायिक उच्च शिक्षा (जैसे वकील, एकाउंटेंट के रूप में अर्हता प्राप्त करना)",
                    "अन्य",
                    "बिल्कुल भी स्कूल शिक्षा नहीं"
                ]
            }
        ]
    }
    result[pagecounter + 3] = {
        name: "post-survey-page-3",
        elements: [

            {
                "type": "radiogroup",
                "name": "survey_question4",
                "title": "निम्नलिखित में से कौनसा उस क्षेत्र/इलाके का सबसे अच्छा वर्णन करता है जिसमें आप रहते हैं ?",
                "isRequired": true,
                "choices": [
                    "महानगरीय शहर (10 लाख से अधिक लोग)",
                    "शहर (1 से 1.5 लाख लोग)",
                    "नगर (50,000 से 1 लाख लोग)",
                    "छोटा शहर (50,000 से कम लोग)",
                    "गाँव (10,000 से कम लोग)"
                ]
            },
            {
                "type": "radiogroup",
                "name": "survey_question5",
                "visibleIf": "{survey_question4} anyof ['महानगरीय शहर (10 लाख से अधिक लोग)', 'शहर (1 से 1.5 लाख लोग)', 'नगर (50,000 से 1 लाख लोग)', 'छोटा शहर (50,000 से कम लोग)']",
                "title": "आप किस प्रकार के घर में रहते हैं ?",
                "isRequired": true,
                "choices": [
                    "5 या अधिक कमरों वाला मकान/फ्लैट",
                    "4 कमरों वाला मकान/फ्लैट",
                    "3 कमरों वाला मकान/फ्लैट",
                    "2 कमरों वाला घर",
                    "1 कमरे वाला घर",
                    "कच्चा घर",
                    "बस्ती/झुग्गी/झोपड़ी"
                ]
            },
            {
                "type": "radiogroup",
                "name": "survey_question6",
                "visibleIf": "{survey_question4} = 'गाँव (10,000 से कम लोग)'",
                "title": "आप किस प्रकार के घर में रहते हैं ?",
                "isRequired": true,
                "choices": [
                    "पक्का (दीवार और छत दोनों पक्की सामग्री से बनी हैं)",
                    "पक्का-कच्चा (या तो दीवार या छत पक्की सामग्री से बनी है, लेकिन अन्य कच्ची सामग्री से)",
                    "कच्चा (दीवार और छत दोनों कच्ची सामग्री से बनी हैं)",
                    "झोपड़ी (दीवार और छत दोनों घास, पत्तियों, मिट्टी, कच्ची ईंट या बांस से बनी हुई)",
                    "N/A"
                ]
            },
        ]
    }
    result[pagecounter + 4] = {
        name: "post-survey-page-4",
        elements: [
            {
                "type": "radiogroup",
                "name": "survey_question7",
                "title": "आपके परिवार का वर्तमान मासिक वेतन (रुपये में) क्या है? कृपया आपके घर में रहने वाले सभी लोगों के संयुक्त मासिक वेतन का अनुमान लगाएं।",
                "choices": [
                    "5,000 से कम",
                    "5,000 - 10,000",
                    "10,000 - 25,000",
                    "25,000 - 50,000",
                    "50,000 - 1 लाख",
                    "1 लाख - 2 लाख",
                    "2 लाख - 5 लाख",
                    "5 लाख - 10 लाख",
                    "10 लाख से अधिक"
                ]
            },
            {
                "type": "matrix",
                "name": "survey_question8",
                "title": "क्या आपके या आपके घर के सदस्यों के पास निम्नलिखित चीजें हैं ?",
                "isRequired": true,
                "columns": [
                    {
                        "value": "हाँ",
                        "text": "हाँ"
                    },
                    {
                        "value": "नहीं",
                        "text": "नहीं"
                    }
                ],
                "rows": [
                    "कार/जीप/वैन",
                    "स्कूटर/मोटरसाइकिल/मोपेड",
                    "एयर कंडीशनर",
                    "कंप्यूटर/लैपटॉप/आई-पैड",
                    "इलेक्ट्रॉनिक पंखा/कूलर",
                    "वॉशिंग मशीन",
                    "फ़्रिज",
                    "टेलीविजन",
                    "बैंक/डाकघर खाता",
                    "एटीएम/डेबिट/क्रेडिट कार्ड",
                    "एल.पी.जी गैस",
                    "घर में इंटरनेट कनेक्शन (मोबाइल फोन को छोड़कर)",
                    "घर के अंदर शौचालय",
                    "पम्पिंग सेट",
                    "ट्रैक्टर"
                ]
            }
        ]
    }
    result[pagecounter + 5] = {
        name: "post-survey-page-5",
        elements: [
            {
                "type": "matrix",
                "name": "survey_question9",
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
                "name": "survey_question10",
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