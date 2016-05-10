var org = require('./auth').org,

    OPPORTUNITY_TOKEN = process.env.OPPORTUNITY_TOKEN;

function execute(req, res) {

    if (req.body.token != OPPORTUNITY_TOKEN) {
        res.send("Invalid token");
        return;
    }

    var q = "SELECT Id, Name, Amount, Probability, StageName, CloseDate FROM Opportunity where Name LIKE '%" + req.body.text + "%' LIMIT 10";
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
                fields.push({title: "Link", value: "https://na4.salesforce.com/" + opportunity.getId(), short:true});
                fields.push({title: "Stage", value: opportunity.get("StageName"), short:true});
                fields.push({title: "Close Date", value: opportunity.get("CloseDate"), short:true});
                fields.push({title: "Amount", value: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(opportunity.get("Amount")), short:true});
                fields.push({title: "Probability", value: opportunity.get("Probability") + "%", short:true});
                attachments.push({color: "#009cdb", fields: fields});
            });
            res.json({text: "Opportunities Matching '" + req.body.text + "':" , attachments: attachments});
        } else {
            res.send("No records");
        }
    });
}

exports.execute = execute;
