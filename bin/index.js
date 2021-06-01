#! /usr/bin/env node

const qs = require('qs');
const cheerio = require('cheerio');
const yargs = require("yargs");
const axios = require("axios");
const notifier = require('node-notifier');
const path = require('path');

const options = yargs
.usage("Usage: -n <name>")
.option("k", { alias: "knowledgeTest", describe: "Knowledge Test (Car or Motorcycle)", type: "boolean" })
.option("d", { alias: "driverTest", describe: "Driver's License Test", type: "boolean" })
.option("m", { alias: "motorcycleTest", describe: "Motorcycle Skills Test", type: "boolean" })
.argv;

const notifierConfig = {
    title: 'DMV Appointment Bot',
    message: 'Hey there!',
    icon: path.join(__dirname, '../images/icon.png'),
    sound: true,
    wait: true
};

if (options.knowledgeTest) {
    lookupKnowledgeTestingDates(123);
} else {
    console.log("oops")
    return;
}

async function lookupKnowledgeTestingDates(locationID) {
    console.log(`Searching for knowledge testing...`);
    const knowledgeTestPlaces = await axios.get("https://www.dmv.virginia.gov/onlineservices/learnersKnowledgeTesting.json").then(res => res.data);

    // console.log("locations", knowledgeTestPlaces);

    // Request Dates
    axios.post("https://vadmvappointments.as.me/schedule.php?action=showCalendar&fulldate=1&owner=19444409&template=monthly", qs.stringify({
            "type": 14002959,
            "calendar": 3963680,
            "skip": true,
            "options[qty]": 1,
            "options[numDays]": 5,
            "calendarID": 3963680
        }), { 
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
            } 
        }
    )
    .then(res => res.data)
    .then(res => {
        const $ = cheerio.load(res);
        const daysHTMl = $(".activeday");
        const days = []

        daysHTMl.each((i, calendarElement) => {
            days.push(new Date(calendarElement.attribs.day))
        });

        notifier.notify({
            ...notifierConfig,
            message: "Found an appointment day!"
        })
        console.log(days[0])

    }).catch(err => {
        console.error(err)
    });
}