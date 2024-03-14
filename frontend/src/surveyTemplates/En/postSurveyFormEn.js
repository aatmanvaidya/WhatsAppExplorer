export default function postSurveyFormEn(unchecked_list, checked_list) {
    let result = [];
    let groups_left = "We noticed that you excluded some groups from your data donation. That's perfectly fine! </br></br> You unchecked the following groups: </br>";

    if (unchecked_list.length === 0) {
        groups_left += "</br>NONE";
    } else {
        for (let i = 0; i < unchecked_list.length; i++) {
            groups_left += "</br> > " + unchecked_list[i];
        }
    }

    let groups_donated = "You chose the following groups: </br>";

    if (checked_list.length === 0) {
        groups_donated += "</br>NONE</br>";
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
            title: groups_left + " </br></br>and " + groups_donated,
        }],
        description: "To better understand what was donated, we would like to know more about what these groups are...",
    };

    for (let i = 0; i < unchecked_list.length; i++) {
        result.push({
                name: "page" + (2 * i + 2),
                elements: [{
                    type: "radiogroup",
                    name: "question2_" + unchecked_list[i],
                    title: "You chose to leave the group " + unchecked_list[i] + ". What types of people are in this group?",
                    isRequired: true,
                    choices: [
                        "I know the people in the group well",
                        "I know the people in the group a little",
                        "I don't know the people in the group",
                    ],
                }, ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [{
                    type: "radiogroup",
                    name: "question3_" + unchecked_list[i],
                    title: "How would you classify your relationship with the people in this group?",
                    isRequired: true,
                    choices: [
                        "Friends",
                        "Family",
                        "Work colleagues",
                        "Neighbors",
                        "People from an organization I belong to (e.g., union, NGOs, etc.)",
                        "People from a political party or political organization I belong to",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [{
                    type: "checkbox",
                    name: "question4_" + unchecked_list[i],
                    title: "What type of messages are frequently posted in the group " +
                        unchecked_list[i] +
                        "? You can select as many categories as you want",
                    isRequired: true,
                    choices: [
                        "News",
                        "Entertainment (funny news, jokes, videos and funny images, music and clips, people dancing, etc.)",
                        "People congratulating members",
                        "Updates about group members",
                        "Work-related messages and materials",
                        "Promotions or commercial materials",
                        "Political content (party propaganda, candidates, memes about politicians, etc.)",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [{
                    type: "radiogroup",
                    name: "question5_" + unchecked_list[i],
                    title: "How much do you interact and pay attention to what is posted in the group " +
                        unchecked_list[i] +
                        "?",
                    isRequired: true,
                    choices: [
                        "A lot of attention (I almost always see)",
                        "Some attention (sometimes I see, sometimes I ignore)",
                        "I don't pay attention (I never look at the group)",
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
                    title: "You chose to participate in the group " + checked_list[i] + ". What types of people are in this group?",
                    isRequired: true,
                    choices: [
                        "I know the people in the group well",
                        "I know the people in the group a little",
                        "I don't know the people in the group",
                    ],
                }, ],
            },
            {
                name: "page" + (2 * i + 3),
                elements: [{
                    type: "radiogroup",
                    name: "checked_question3_" + checked_list[i],
                    title: "How would you classify your relationship with the people in this group?",
                    isRequired: true,
                    choices: [
                        "Friends",
                        "Family",
                        "Work colleagues",
                        "Neighbors",
                        "People from an organization I belong to (e.g., union, NGOs, etc.)",
                        "People from a political party or political organization I belong to",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 4),
                elements: [{
                    type: "checkbox",
                    name: "checked_question4_" + checked_list[i],
                    title: "What type of messages are frequently posted in the group " +
                        checked_list[i] +
                        "? You can select as many categories as you want",
                    isRequired: true,
                    choices: [
                        "News",
                        "Entertainment (funny news, jokes, videos and funny images, music and clips, people dancing, etc.)",
                        "People congratulating members",
                        "Updates about group members",
                        "Work-related messages and materials",
                        "Promotions or commercial materials",
                        "Political content (party propaganda, candidates, memes about politicians, etc.)",
                    ],
                    showOtherItem: true,
                }, ],
            },
            {
                name: "page" + (2 * i + 5),
                elements: [{
                    type: "radiogroup",
                    name: "checked_question5_" + checked_list[i],
                    title: "How much do you interact and pay attention to what is posted in the group " +
                        checked_list[i] +
                        "?",
                    isRequired: true,
                    choices: [
                        "A lot of attention (I almost always see)",
                        "Some attention (sometimes I see, sometimes I ignore)",
                        "I don't pay attention (I never look at the group)",
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
