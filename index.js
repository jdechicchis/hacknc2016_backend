'use strict'

var send_message = require('./send_message')

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

var sessions = {}	// store session information

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'joseph') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
  console.log("message recieved")
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id

		if (sessions[sender] == null) {

			sessions[sender] = {
				"locations": [],
				"roles": [],
				"size": "",
				"field": [],
				"languages": [],
				"platforms": []
			}
		}
		//randomResponse(sender)
		if (event.message && event.message.text) {
			let text = event.message.text.toLowerCase()

			var dataLogged = false

			if (textContains(text, ["software", "artificial intelligence", "machine learning", "ios", "web", "mobile", "mac", "windows", "linux"])) {
				addRoletoSender(sender, "SE")
				randomMoreInfoResponse(sender)
				dataLogged = true
			}
			if (textContains(text, ["quality"])) {
				addRoletoSender(sender, "QA")
				randomMoreInfoResponse(sender)
				dataLogged = true
			}
			if (textContains(text, ["user interface", "user experience", "ux", "design"])) {
				addRoletoSender(sender, "UI")
				randomMoreInfoResponse(sender)
				dataLogged = true
			}
			if (textContains(text, ["pm", "project management", "product management"])) {
				addRoletoSender(sender, "PM")
				randomMoreInfoResponse(sender)
				dataLogged = true
			}
			if (textContains(text, ["data analyst", "big data", "statistics"])) {
				addRoletoSender(sender, "DA")
				randomMoreInfoResponse(sender)
				dataLogged = true
			}
			if (dataLogged == false) {
				if (text === "help") {
					send_message.text(sender, "So you need help?\n\nWell, all you have to do is type out what kind of internship you're interested in, and I'm smart enough to understand!\n\nYou can tell me about the size, location, languages used and more about your perfect internship!")
				}
				else if (text === 'generic') {
					send_message.generic(sender)
				}
				else {
					send_message.text(sender, "Sorry, I don't know what you meant by \"" + text.substring(0, 200) + "\"")
				}

				continue
			}
		}
		if (event.postback) {
			//let callback = JSON.stringify(event.postback)
			//console.log("Postback: " + callback)
			//console.log("callback: " + event.postback["payload"])
			let payload = event.postback["payload"];
			console.log("Payload: "+ payload);
			if (payload == "GET_STARTED") {
					send_message.quickReplies(sender, "Welcome! I can help you find the perfect internship for you.\n\nWhat kind of internship are you looking for?", [{"content_type":"text", "title":"Software Engineer", "payload": "SE"},{"content_type":"text", "title":"PM", "payload": "PM"}])
					//send_message.text(sender, "Welcome! I can help you find the perfect internship for you.\n\nSay \"help\" at any time for instructions\n\nWhat kind of internship are you looking for?")
			}
			else if (payload == "SE") {
				addRoletoSender(sender, "SE")
				randomMoreInfoResponse(sender)
			}
			else if (payload == "PM") {
				addRoletoSender(sender, "PM")
				randomMoreInfoResponse(sender)
			}
			//send_message.text(sender, "Postback received: "+callback.substring(0, 200))
		}

		if (checkCanSuggest(sender) == true) {

		}
	}
	res.sendStatus(200)
})

function checkCanSuggest(sender) {
	console.log("Session: " + JSON.stringify(sessions[sender]))
	if (sessions[sender]["locations"].length == 0) { return false }
	if (sessions[sender]["roles"].length == 0) { return false }
	if (sessions[sender]["size"] == "") { return false }
	if (sessions[sender]["field"].length == 0) { return false }
	if (sessions[sender]["languages"].length == 0) { return false }
	if (sessions[sender]["platforms"].length == 0) { return false }

	return true
}

function addRoletoSender(sender, role) {
	let userRoles = sessions[sender]["roles"]
	if (userRoles.length == 0) {
		sessions[sender]["roles"] = [role]
	}
	else if (userRoles.arrayContains(role) == false) {
		sessions[sender]["roles"] = userRoles.push(role)
	}
}

function randomResponse(sender) {
	let randomWords = ["OK", "I understand", "Let me see what I can do...", "I'll try my best to help you", "I got your back!", "Awesome!"]
	send_message.text(sender, randomWords[Math.floor(Math.random() * randomWords.length)])
}

function randomMoreInfoResponse(sender) {
	let randomWords = ["Got it. Any other interests? If not, tell us other things about where you want to intern", "Great! Tell us more about what you're looking for", "Awesome! Anything else?", "Very cool. What else are you looking for?"]
	send_message.text(sender, randomWords[Math.floor(Math.random() * randomWords.length)])
}

Array.prototype.arrayContains = function(k) {
	for(var i=0;i<this.length;i++) {
		if(this[i] === k) {return true}
	}
  return false
}

function textContains(text,array) {
	console.log("textContains: " + text + " **** " + array);
	var s = ""
	for(var i=0;i<array.length;i++) {
		if(text.includes(array[i])) {return true}
	}

	return false
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

// static website code

app.get("/*", function(request, response, next) {
    console.log("404 not found")
    response.sendFile(__dirname + '/public/404.html')
});
