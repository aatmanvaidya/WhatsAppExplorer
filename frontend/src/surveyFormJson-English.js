export default function listToJson(unchecked_list, checked_list) {
    let result = [];
    let groups_left = "You opted out of the following group(s) : </br>"

    if (unchecked_list.length === 0) {
        groups_left += "</br>NONE";
    }
    else {
        for (let i = 0; i < unchecked_list.length; i++) {
            groups_left += "</br> > " + unchecked_list[i];
        }
    }


    let groups_donated = "You chose to share messages from the following group(s) : </br>"

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
            "We see that you excluded a number of groups from the donation. This is fine! As we told you, we now cannot access the data from these groups. To understand what you gave us, we would however like to understand what kind of groups these are…."
    }

    for (let i = 0; i < unchecked_list.length; i++) {
        let jsonObj = [{
            name: "page" + (pagecounter + 2),
            elements: [
                {
                    type: "radiogroup",
                    name: "question2" + "_" + (unchecked_list[i]),
                    title:
                        "You excluded a group named " + unchecked_list[i] + ". What kind of people are in this group?",
                    isRequired: true,
                    choices: [
                        "Mostly people I know well",
                        "Mostly people I vaguely know",
                        "Mostly people I don't know at all"
                    ]
                }
            ],
            title: "You opted out of the group: </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 3),
            elements: [
                {
                    type: "radiogroup",
                    name: "question3" + "_" + unchecked_list[i],
                    title: "Are these people….?",
                    isRequired: true,
                    choices: [
                        "Friends",
                        "Relatives/Family",
                        "Colleagues",
                        "Immediate Neighbours",
                        "People from an association I am part of (for instance, union etc…)",
                        "People from an informal group I am part of",
                        "People from a political party or political association I am part of"
                    ],
                    showOtherItem: true
                }
            ],
            title: "You opted out of the group: </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 4),
            elements: [
                {
                    type: "checkbox",
                    name: "question4" + "_" + unchecked_list[i],
                    title:
                        "Which of the following types of content are regularly posted on  " + unchecked_list[i] + ". [you may click as many as needed]?",
                    isRequired: true,
                    choices: [
                        "News",
                        "Entertainment",
                        "Salutations / Wishes",
                        "Updates about group members",
                        "Practical and logistical messages",
                        "Advertising / Propaganda"
                    ],
                    showOtherItem: true
                }
            ],
            title: "You opted out of the group: </br>" + unchecked_list[i]
        },
        {
            name: "page" + (pagecounter + 5),
            elements: [
                {
                    type: "radiogroup",
                    name: "question5" + "_" + unchecked_list[i],
                    title:
                        "How much do you engage with or pay attention to the content posted on " + unchecked_list[i] + " ?",
                    isRequired: true,
                    choices: [
                        "A lot of attention - I almost always look at it",
                        "Some attention - I sometimes look at it, other times ignore.",
                        "No attention at all - I never look at it."
                    ]
                }
            ],
            title: "You opted out of the group: </br>" + unchecked_list[i]
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
                        "What kind of people are in this group?",
                    isRequired: true,
                    choices: [
                        "Mostly people I know well",
                        "Mostly people I vaguely know",
                        "Mostly people I don't know at all"
                    ]
                }
            ],
            title: "You agreed to share messages from the group: </br>" + checked_list[i]

        },
        {
            name: "page" + (pagecounter + 3),
            elements: [
                {
                    type: "radiogroup",
                    name: "checked_question3" + "_" + checked_list[i],
                    title: "Are these people….?",
                    isRequired: true,
                    choices: [
                        "Family",
                        "Relatives/Family",
                        "Colleagues",
                        "Immediate Neighbours",
                        "People from an association I am part of (for instance, union etc…)",
                        "People from an informal group I am part of",
                        "People from a political party or political association I am part of"
                    ],
                    showOtherItem: true
                }
            ],
            title: "You agreed to share messages from the group: </br>" + checked_list[i]

        },
        {
            name: "page" + (pagecounter + 4),
            elements: [
                {
                    type: "checkbox",
                    name: "checked_question4" + "_" + checked_list[i],
                    title:
                        "Which of the following types of content are regularly posted on  " + checked_list[i] + ". [you may click as many as needed]?",
                    isRequired: true,
                    choices: [
                        "Serious news.",
                        "Funny news and jokes",
                        "Wishes.",
                        "Sexual content.",
                        "Messages to help coordinate meetings/events.",
                        "Updates about group members.",
                        "Visual content documenting events/celebrations etc.",
                        "Selfies.",
                        "Work-related messages and content",
                        "Advice / how to deal with personal problems.",
                        "Messages and discussion about social issues.",
                        "Messages and discussion about political issues.",
                        "Advertising",
                        "Propaganda"
                    ],
                    showOtherItem: true
                }
            ],
            title: "You agreed to share messages from the group: </br>" + checked_list[i]
        },
        {
            name: "page" + (pagecounter + 5),
            elements: [
                {
                    type: "radiogroup",
                    name: "checked_question5" + "_" + checked_list[i],
                    title:
                        "How much do you engage with or pay attention to the content posted on " + checked_list[i] + " ?",
                    isRequired: true,
                    choices: [
                        "A lot of attention - I almost always look at it",
                        "Some attention - I sometimes look at it, other times ignore.",
                        "No attention at all - I never look at it."
                    ]
                }
            ],
            title: "You agreed to share messages from the group: </br>" + checked_list[i]
        }]

        for (let p = 1; p < 5; p++) {
            result[pagecounter + p] = jsonObj[p - 1]
        }
        pagecounter = pagecounter + 4;

    }


    let surveyForm = {
        "progressBarType": "pages",
        "showProgressBar": "top",
        logoPosition: "right",
        pages: result
    };
    return JSON.stringify(surveyForm);
}