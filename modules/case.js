var nforce = require('nforce'),
    org = require('./auth').org,

    CASE_TOKEN = process.env.CASE_TOKEN;

function execute(req, res) {

    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }

     var q = "SELECT Id, Name, Phone, Account_Owner__c, Type, BillingStreet, BillingCity, BillingState, Account_Manager__c, Solutions_Engineer__c, PGM__c FROM Account WHERE Name LIKE '%" + req.body.text + "%' LIMIT 10";
    org.query({query: q}, function(err, resp) {
        if (err) {
            console.error(err);
            res.send("An error as occurred");
            return;
        }
        if (resp.records && resp.records.length>0) {
            var accounts = resp.records;
            var attachments = [];
            accounts.forEach(function(account) {
                var fields = [];
                fields.push({title: "Name:", value: account.get("Name"), short:true});
                fields.push({title: "Owner:", value: account.get("Account_Owner__c"), short:true});
                fields.push({title: "AM:", value: account.get("Account_Manager__c"), short:true});
                fields.push({title: "SE:", value: account.get("Solutions_Engineer__c"), short:true});
                fields.push({title: "PGM:", value: account.get("PGM__c"), short:true});
                fields.push({title: "Account Type:", value: account.get("Type"), short:true});
                fields.push({title: "Link", value: "https://login.salesforce.com/" + account.getId(), short:true});
                attachments.push({color: "#009cdb", fields: fields});
            });
            res.json({text: "Accounts matching '" + req.body.text + "':", attachments: attachments});
        } else {
            res.send("No records");
        }
    });
}

exports.execute = execute;
