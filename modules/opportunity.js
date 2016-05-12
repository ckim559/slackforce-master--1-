var org = require('./auth').org,

    OPPORTUNITY_TOKEN = process.env.OPPORTUNITY_TOKEN;

function execute(req, res) {

    if (req.body.token != OPPORTUNITY_TOKEN) {
        res.send("Invalid token");
        return;
    }

    var q = "SELECT Id, Name, Opportunity_Record_Type__c, Opp_Account_Name_API__c, Opp_Type__c, Opportunity_Owner__c, Amount, Probability, StageName, CloseDate FROM Opportunity where Name LIKE '%" + req.body.text + "%' AND (NOT Opportunity_Record_Type__c LIKE 'Services Project Request%') LIMIT 10";
    org.query({query: q}, function(err, resp) {
        if (err) {
            console.error(err);
            res.send("An error as occurred");
            return;
        }
        
        if (resp.records && resp.records.length>0) {
            var opportunities = resp.records;
            var attachments = [];
            opportunities.forEach(function(opportunity) {
                var fields = [];
                fields.push({title: "Opportunity", value: opportunity.get("Name"), short:true});
                fields.push({title: "Link", value: "https://login.salesforce.com/" + opportunity.getId(), short:true});
                fields.push({title: "Stage", value: opportunity.get("StageName"), short:true});
                fields.push({title: "Account", value: opportunity.get("Opp_Account_Name_API__c"), short:true});
		fields.push({title: "Opportunity Owner", value: opportunity.get("Opportunity_Owner__c"), short:true});
                fields.push({title: "Close Date", value: opportunity.get("CloseDate"), short:true});
                fields.push({title: "Record Type", value: opportunity.get("Opportunity_Record_Type__c"), short:true});
		fields.push({title: "Opportunity Type", value: opportunity.get("Opp_Type__c"), short:true});
                attachments.push({color: "#db002f", fields: fields});
            });
            res.json({text: "Opportunities Matching '" + req.body.text + "':" , attachments: attachments});
        } else {
            res.send("No records");
        }
    });
}

exports.execute = execute;
