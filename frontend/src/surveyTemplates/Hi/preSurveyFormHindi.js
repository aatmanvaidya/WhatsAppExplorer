export default function preSurveyJsonHindi() {
    let result = [
        {
            "name": "post-survey-page-1",
            "elements": [
                {
                    "type": "text",
                    "name": "age",
                    "title": "आपका उम्र क्या है ?",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0,
                    "max": 100,
                    "minErrorText": "Input range: 0 - 100",
                    "maxErrorText": "Input range: 0 - 100"
                },
                {
                    "type": "radiogroup",
                    "name": "religion",
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
        },
        {
            "name": "post-survey-page-2",
            "elements": [
                {
                    "type": "dropdown",
                    "name": "District",
                    "title": "आप किस जिले में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Hardoi",
                            "text": "हरदोई"
                        },
                        {
                            "value": "Lucknow",
                            "text": "लखनऊ"
                        },
                        {
                            "value": "Ayodhya",
                            "text": "अयोध्या"
                        },
                        {
                            "value": "Sitapur",
                            "text": "सीतापुर"
                        },
                        {
                            "value": "Amethi",
                            "text": "अमेठी"
                        },
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "Town_Hardoi",
                    "visibleIf": "{District} = 'Hardoi'",
                    "title": "आप किस शहर में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Hardoi North of NH731 ",
                            "text": " नेशनल हाईवे 731 के उत्तर, हरदोई"
                        },
                        {
                            "value": "Hardoi South of NH731 ",
                            "text": " नेशनल हाईवे 731 के दक्षिण, हरदोई"
                        },
                        {
                            "value": "Gopamau ",
                            "text": " गोपामऊ"
                        },
                        {
                            "value": "Sandila ",
                            "text": " संदीला"
                        },
                        {
                            "value": "Shahabad ",
                            "text": " शाहाबाद"
                        },
                        {
                            "value": "Pihani ",
                            "text": " पीहानी"
                        },
                        {
                            "value": "Mallawan ",
                            "text": " मल्लावां"
                        },
                        {
                            "value": "Bilgram ",
                            "text": " बिलग्राम"
                        },
                        {
                            "value": "Sandi ",
                            "text": " संदी"
                        },
                        {
                            "value": "Pali ",
                            "text": " पाली"
                        },
                        {
                            "value": "Replacement 1",
                            "text": "Replacement 1"
                        },
                        {
                            "value": "Replacement 2",
                            "text": "Replacement 2"
                        },
                        {
                            "value": "Replacement 3",
                            "text": "Replacement 3"
                        },
                        {
                            "value": "Replacement 4",
                            "text": "Replacement 4"
                        },
                        {
                            "value": "Replacement 5",
                            "text": "Replacement 5"
                        }
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "Town_Lucknow",
                    "visibleIf": "{District} = 'Lucknow'",
                    "title": "आप किस शहर में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Bakshi ka Talab ",
                            "text": " बक्शी का तालाब"
                        },
                        {
                            "value": "Malihabad ",
                            "text": " मलिहाबाद"
                        },
                        {
                            "value": "Amethi ",
                            "text": " अमेठी"
                        },
                        {
                            "value": "LDA Colony ",
                            "text": " एलडीए कॉलोनी"
                        },
                        {
                            "value": "Rajajipuram ",
                            "text": " राजाजीपुरम"
                        },
                        {
                            "value": "Aliganj ",
                            "text": " अलीगंज"
                        },
                        {
                            "value": "Indira Nagar ",
                            "text": " इंदिरा नगर"
                        },
                        {
                            "value": "Gomti Nagar ",
                            "text": " गोमती नगर"
                        },
                        {
                            "value": "Cantonment ",
                            "text": " कैंटोनमेंट"
                        },
                        {
                            "value": "Triveni Nagar ",
                            "text": " त्रिवेणी नगर"
                        },
                        {
                            "value": "Replacement 1",
                            "text": "Replacement 1"
                        },
                        {
                            "value": "Replacement 2",
                            "text": "Replacement 2"
                        },
                        {
                            "value": "Replacement 3",
                            "text": "Replacement 3"
                        },
                        {
                            "value": "Replacement 4",
                            "text": "Replacement 4"
                        },
                        {
                            "value": "Replacement 5",
                            "text": "Replacement 5"
                        }
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "Town_Ayodhya",
                    "visibleIf": "{District} = 'Ayodhya'",
                    "title": "आप किस शहर में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Faizabad: Naharbagh / Rikabganj / Angoori Bagh ",
                            "text": " फ़ैज़ाबाद: नहरबाग / रिकाबगंज / अंगूरी बाग"
                        },
                        {
                            "value": "Faizabad: Wazeerganj / Janoura ",
                            "text": " फ़ैज़ाबाद: वज़ीरगंज / जनौरा"
                        },
                        {
                            "value": "Faizabad: JB Puram colony / Khojanpur / Sharda Nagar ",
                            "text": " फ़ैज़ाबाद: जेबी पुरम कॉलोनी / खोजनपुर / शारदा नगर"
                        },
                        {
                            "value": "Faizabad: Shakti Nagar / Beniganj / Shajahanjpur ",
                            "text": " फ़ैज़ाबाद: शक्ति नगर / बेनीगंज / शाहजहाँपुर"
                        },
                        {
                            "value": "Faizabad Rural / Deokaali ",
                            "text": " फ़ैज़ाबाद ग्रामीण / देओकाली"
                        },
                        {
                            "value": "Ayodhya (North of Ayodhya Junction) ",
                            "text": " अयोध्या (अयोध्या जंक्शन के उत्तर)"
                        },
                        {
                            "value": "Ayodhya (South of Ayodhya Junction) ",
                            "text": " अयोध्या (अयोध्या जंक्शन के दक्षिण)"
                        },
                        {
                            "value": "Rudauli ",
                            "text": " रुदौली"
                        },
                        {
                            "value": "Bikapur ",
                            "text": " बिकापुर"
                        },
                        {
                            "value": "Bhadarsa ",
                            "text": " भदरसा"
                        },
                        {
                            "value": "Replacement 1",
                            "text": "Replacement 1"
                        },
                        {
                            "value": "Replacement 2",
                            "text": "Replacement 2"
                        },
                        {
                            "value": "Replacement 3",
                            "text": "Replacement 3"
                        },
                        {
                            "value": "Replacement 4",
                            "text": "Replacement 4"
                        },
                        {
                            "value": "Replacement 5",
                            "text": "Replacement 5"
                        }
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "Town_Sitapur",
                    "visibleIf": "{District} = 'Sitapur'",
                    "title": "आप किस शहर में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Maholi ",
                            "text": " महोली"
                        },
                        {
                            "value": "Misrikh / neemsar ",
                            "text": " मिस्रिख / नीमसर"
                        },
                        {
                            "value": "Sitapur (North of Lalbagh road) ",
                            "text": " सीतापुर (लालबाग रोड के उत्तर)"
                        },
                        {
                            "value": "Sitapur (South of Lalbagh road) ",
                            "text": " सीतापुर (लालबाग रोड के दक्षिण)"
                        },
                        {
                            "value": "Khairabad ",
                            "text": " खैराबाद"
                        },
                        {
                            "value": "Naiparapur ",
                            "text": " नईपरापुर"
                        },
                        {
                            "value": "Laharpur ",
                            "text": " लहरपुर"
                        },
                        {
                            "value": "Biswan ",
                            "text": " बिसवां"
                        },
                        {
                            "value": "Mahmudabad ",
                            "text": " महमूदाबाद"
                        },
                        {
                            "value": "Sidhauli ",
                            "text": " सीधौली"
                        },
                        {
                            "value": "Replacement 1",
                            "text": "Replacement 1"
                        },
                        {
                            "value": "Replacement 2",
                            "text": "Replacement 2"
                        },
                        {
                            "value": "Replacement 3",
                            "text": "Replacement 3"
                        },
                        {
                            "value": "Replacement 4",
                            "text": "Replacement 4"
                        },
                        {
                            "value": "Replacement 5",
                            "text": "Replacement 5"
                        }
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "Town_Amethi",
                    "visibleIf": "{District} = 'Amethi'",
                    "title": "आप किस शहर में रहते हैं?",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Kathaura ",
                            "text": " कठौरा"
                        },
                        {
                            "value": "Musafirkhana ",
                            "text": " मुसाफिरखाना"
                        },
                        {
                            "value": "Gauriganj ",
                            "text": " गौरीगंज"
                        },
                        {
                            "value": "Amethi ",
                            "text": " अमेठी"
                        },
                        {
                            "value": "Salon ",
                            "text": " सैलोन"
                        },
                        {
                            "value": "Parsadepur ",
                            "text": " परसादेपुर"
                        },
                        {
                            "value": "Jais ",
                            "text": " जैस"
                        },
                        {
                            "value": "Bahadurpur da Jaias ",
                            "text": " बहादुरपुर दा जैस"
                        },
                        {
                            "value": "Nihal Garh Chak Jangla ",
                            "text": " निहालगढ़ चक जांगला"
                        },
                        {
                            "value": "Inhauna ",
                            "text": " इन्हौना"
                        },
                        {
                            "value": "Replacement 1",
                            "text": "Replacement 1"
                        },
                        {
                            "value": "Replacement 2",
                            "text": "Replacement 2"
                        },
                        {
                            "value": "Replacement 3",
                            "text": "Replacement 3"
                        },
                        {
                            "value": "Replacement 4",
                            "text": "Replacement 4"
                        },
                        {
                            "value": "Replacement 5",
                            "text": "Replacement 5"
                        }
                    ]
                }
            ]
        },
        {
            "name": "post-survey-page-3",
            "elements": [
                {
                    "type": "radiogroup",
                    "name": "caste",
                    "title": "आप निम्नलिखित में से किस जाति वर्ग से सम्बोधित हैं ?",
                    "isRequired": true,
                    "choices": [
                        "जनरल/उच्च",
                        "ओ.बी.सी (अन्य पिछड़ा वर्ग)",
                        "दलित/अनुसूचित जाति",
                        "आदिवासी/अनुसूचित जनजाति ",
                        "गैर-हिंदू"
                    ]
                },
                {
                    "type": "radiogroup",
                    "name": "education",
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
        },
        {
            "name": "post-survey-page-4",
            "elements": [
                {
                    "type": "radiogroup",
                    "name": "Residental area type",
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
                    "name": "House type - non village",
                    "visibleIf": "{Residental area type} anyof ['महानगरीय शहर (10 लाख से अधिक लोग)', 'शहर (1 से 1.5 लाख लोग)', 'नगर (50,000 से 1 लाख लोग)', 'छोटा शहर (50,000 से कम लोग)']",
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
                    "name": "House type - village",
                    "visibleIf": "{Residental area type} = 'गाँव (10,000 से कम लोग)'",
                    "title": "आप किस प्रकार के घर में रहते हैं ?",
                    "isRequired": true,
                    "choices": [
                        "पक्का (दीवार और छत दोनों पक्की सामग्री से बनी हैं)",
                        "पक्का-कच्चा (या तो दीवार या छत पक्की सामग्री से बनी है, लेकिन अन्य कच्ची सामग्री से)",
                        "कच्चा (दीवार और छत दोनों कच्ची सामग्री से बनी हैं)",
                        "झोपड़ी (दीवार और छत दोनों घास, पत्तियों, मिट्टी, कच्ची ईंट या बांस से बनी हुई)",
                        "N/A"
                    ]
                }
            ]
        },
        {
            "name": "post-survey-page-5",
            "elements": [
                {
                    "type": "radiogroup",
                    "name": "Monthly Income",
                    "title": "आपके परिवार का वर्तमान मासिक वेतन (रुपये में) क्या है? कृपया आपके घर में रहने वाले सभी लोगों के संयुक्त मासिक वेतन का अनुमान लगाएं।",
                    "isRequired": true,
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
                    "name": "Resources",
                    "title": "क्या आपके या आपके घर के सदस्यों के पास निम्नलिखित चीजें हैं ?",
                    "isRequired": true,
                    "columns": [
                        "हाँ",
                        "नहीं"
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
    ];

    let preSurveyForm = {
        "progressBarType": "pages",
        "showProgressBar": "top",
        logoPosition: "right",
        pages: result
    };
    return JSON.stringify(preSurveyForm);
}