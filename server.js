var express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./modules/auth'),
    contact = require('./modules/contact'),
    opportunity = require('./modules/opportunity'),
    _case = require('./modules/case'),
    app = express();
    
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN,

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),

    controller = Botkit.slackbot(),

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({extended: true}));

app.post('/pipeline', opportunity.execute);
app.post('/contact', contact.execute);
app.post('/case', _case.execute);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
    auth.login();
});

 bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});


controller.hears(['help', "'help'"], 'direct_message,direct_mention,mention', (bot, message) => {
	
   let help;
	
   let askHelp = (response, convo) => {
        convo.ask("Help Categories:" + "\n" + "1. Accounts" + "\n" + "2. Opportunities" + "\n" + "3. Contacts", (response, convo) => {
		help = response.text; 
   
   if(help.toUpperCase() == 'ACCOUNTS'|| help.toUpperCase() == '1. ACCOUNTS' || help == '1' || help == '1.')
	{
		bot.reply(message, {
        text: `Account Requests:
	- To search for an account you can ask me things like "Search account Freewheel" or #A Freewheel.
	- To search for an account by owner, ask me "Search accounts owned by Jeff Smith"
	- For advanced search type "Account Search" or "#Account"`
		});
		convo.next();
	}
	else if(help.toUpperCase() == 'OPPORTUNITIES'|| help.toUpperCase() == '2. OPPORTUNITIES' || help == '2' || help == '2.')
	{
		bot.reply(message, {
		text: `Opportunity Requests:
	- To search for an opportunity you can ask me things like "Search opportunity NBC" or #O NBC.
	- To search for an opportunity by owner, ask me "Search opportunities owned by Jeff Smith"
	- For advanced search type "Opportunity Search" or "#Opportunities"`
		});
		convo.next();
	} 
	else if(help.toUpperCase() == 'Contacts'|| help.toUpperCase() == '3. Contacts' || help == '3' || help == '3.')
	{
		bot.reply(message, {
		text: `Contact Requests:
	- To search for a contact you can ask me things like "Search contact Lisa Smith" or "#C Lisa Smith".
	- To search for a contact in an account, ask me "Search contacts in account Twitter"`
		});
		convo.next();
	}
	else
	{
		bot.reply(message, "Sorry that is not a valid option. Please try again.");
					askHelp(response, convo);
					convo.next();
	}
   });
   };
   bot.startConversation(message, askHelp);
 
});

controller.hears(['hello', 'hi', 'hey', 'greetings'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Hello, I'm Salesforce bot! I help with various Salesforce requests. To learn more please type 'help'.`
    });
});

controller.hears(['Account Search', '#Accounts', '#Account'], 'direct_message,direct_mention,mention', (bot, message) => {

  let name,
	  type,
	  owner;

   let askName = (response, convo) => {

        convo.ask("What is the Account Name? (or enter '%' for all accounts)", (response, convo) => {
		if(name == '%' || name == "'%'")
		{
			name = '%'
		}
		else
		{
			name = response.text; 
		}
		askType(response, convo);
		convo.next();
		});

   };
   
   let askType = (response, convo) => {

        convo.ask("What is the Account Type?:" + "\n" + "1. All" + "\n" + "2. Prospect" + "\n" + "3. Client" + "\n" + "4. Former Client", (response, convo) => {
		type = response.text; 
		if(type.toUpperCase() == 'ALL' || type.toUpperCase() == '1. ALL' || type == '1' || type == '1.')
			{
				type = '%'; 
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'PROSPECT' || type.toUpperCase() == '2. PROSPECT' || type == '2' || type == '2.')
			{
				type = 'Prospect';
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'CLIENT' || type.toUpperCase() == '3. CLIENT' || type == '3' || type == '3.')
			{
				type = 'Client';
				askOwner(response, convo);
				convo.next();
			}
		else if(type.toUpperCase() == 'FORMER CLIENT' || type.toUpperCase() == '4. FORMER CLIENT' || type == '4' || type == '4.')
			{
				type = 'Former Client';
				askOwner(response, convo);
				convo.next();
			}	
		else 
			{
				bot.reply(message, "Sorry that is not a valid option. Please try again.");
				askType(response, convo);
				convo.next();
			};	
		});

   };
   
   let askOwner = (response, convo) => {
	   convo.ask("Who is the Account Owner? (or enter '%' for all owners)", (response, convo) => {
		   owner = response.text;
		   
		   if(owner == '%' || owner == "'%'")
			{
			owner = '%'; 
			}
		else {
		 owner = response.text;
			};	
			if(type == '%')
			{
				salesforce.findAccount3(owner, name)
				.then(accounts => bot.reply(message, {
				text: "Results:",
				attachments: formatter.formatAccounts(accounts)
				}));
			}
			else
				{
				salesforce.findAccount4(owner, name, type)
				.then(accounts => bot.reply(message, {
				text: "Results:",
				attachments: formatter.formatAccounts(accounts)
				}));
				}
			convo.next();
	   });	

	};		

 bot.reply(message, "OK, I can help you with that!");
 bot.startConversation(message, askName);	
 
});

controller.hears(['Opportunity Search', '#Opportunity', '#Opportunities'], 'direct_message,direct_mention,mention', (bot, message) => {

  let name,
	  owner,
	  stage,
	  type;

   let askName = (response, convo) => {

        convo.ask("What is the Account Name?  (or enter '%' for all Accounts)", (response, convo) => {
		name = response.text; 
		 if(name == '%' || name == "'%'")
			{
			name = '%'; 
			}
		else {
		 owner = response.text;
			};	
		askOwner(response, convo);
		convo.next();
		});

   };
   
   let askOwner = (response, convo) => {
	   convo.ask("Who is the Opportunity Owner? (or enter '%' for all owners)", (response, convo) => {
		   owner = response.text;
		   
		   if(owner == '%' || owner == "'%'")
			{
			owner = '%'; 
			}
		else {
		 owner = response.text;
			};	
			askStage(response, convo);
			convo.next();
	   });	

	};

   let askStage = (response, convo) => {
	   convo.ask("Which Opportunity Stage Status?:" + "\n" + "1. All" + "\n" + "2. Closed Won" + "\n" + "3. Open", (response, convo) => {
		   stage = response.text;
		   
		   if(stage.toUpperCase() == 'ALL' || stage.toUpperCase() == '1. ALL' || stage == '1' || stage == '1.')
		   {
			   stage = '%';
			   askType(response, convo);
			   convo.next();
		   }
		   else if (stage.toUpperCase() == 'CLOSED WON' || stage.toUpperCase() == '2. CLOSED WON' || stage == '2' || stage == '2.')
		   {
			   stage = 'Closed Won';
			   askType(response, convo);
			   convo.next();
		   }
		    else if (stage.toUpperCase() == 'OPEN' || stage.toUpperCase() == '3. OPEN' || stage == '3' || stage == '3.')
		   {
			   stage = 'Open';
			   askType(response, convo);
			   convo.next();
		   }
		   else
			{
			bot.reply(message, "Sorry that is not a valid option. Please try again.");				
			askStage(response, convo);
			convo.next();
			}
	   });
   };	
	
	let askType = (response, convo) => {
	   convo.ask("Which Opportunity Type?:" + "\n" + "1. All" + "\n" + "2. New" + "\n" + "3. Renewal" + "\n" + "4. Add On", (response, convo) => {
		   type = response.text;
				if(type.toUpperCase() == 'ALL' || type.toUpperCase() == '1. ALL' || type == '1' || type == '1.')
				{
					type = '%';
				}
				else if(type.toUpperCase() == 'NEW' || type.toUpperCase() == '2. NEW' || type == '2' || type == '2.')
				{
					type = 'New';
				}
				else if(type.toUpperCase() == 'RENEWAL' || type.toUpperCase() == '3. RENEWAL' || type == '3' || type == '3.')
				{
					type = 'Renewal';
				}
				else if(type.toUpperCase() == 'ADD ON' || type.toUpperCase() == '4. ADD ON' || type == '4' || type == '4.')
				{
					type = 'Add On';
				}
				else
				{
					bot.reply(message, "Sorry that is not a valid option. Please try again.");
					askType(response, convo);
					convo.next();
				}
			if(type == '%' || type == 'New' || type == 'Renewal' || type == 'Add On')
			{
				salesforce.findOpportunity4(type, owner, name, stage)
				.then(opportunities => bot.reply(message, {
				text: "Results:" ,
				attachments: formatter.formatOpportunities(opportunities)
				}));
				convo.next();
			}
		

		});
	};

 bot.reply(message, "OK, I can help you with that!");
 bot.startConversation(message, askName);	
 
});

controller.hears(['Destroyself'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `Goodbye`
    });
	bot.destroy()
});


controller.hears(['search account (.*)', 'search (.*) in accounts', '#a (.*)', 'find account (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findAccount(name)
        .then(accounts => bot.reply(message, {
            text: "I found these accounts matching  '" + name + "':",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search accounts owned by (.*)', 'find accounts owned by (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findAccount2(name)
        .then(accounts => bot.reply(message, {
            text: "I found these accounts owned by  '" + name + "':",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['search contact (.*)', 'find contact (.*)', '#C (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findContact(name)
        .then(contacts => bot.reply(message, {
            text: "I found these contacts matching  '" + name + "':",
            attachments: formatter.formatContacts(contacts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['search contacts in Account (.*)', 'find contacts in Account (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findContact2(name)
        .then(contacts => bot.reply(message, {
            text: "I found these contacts in Account '" + name + "':",
            attachments: formatter.formatContacts(contacts)
        }))
        .catch(error => bot.reply(message, error));
});


controller.hears(['top (.*) deals', 'top (.*) opportunities'], 'direct_message,direct_mention,mention', (bot, message) => {
    let count = message.match[1];
    salesforce.getTopOpportunities(count)
        .then(opportunities => bot.reply(message, {
            text: "Here are your top " + count + " opportunities:",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search opportunity (.*)', 'find opportunity (.*)', '#O (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities matching  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['search opportunities owned by (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity2(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities owned by  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['search opportunities in account (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity3(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities in account  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `I'm sorry, I didn't understand that. To learn how to make Salesforce requests please type 'help'.`
    });
});
