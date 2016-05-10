var nforce = require('nforce'),
    org = require('./auth').org,

    CASE_TOKEN = process.env.CASE_TOKEN;

function execute(req, res) {

    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }

     var q = "SELECT Id, Name FROM Account WHERE Name LIKE '%" + req.body.text + "%' LIMIT 10";
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
                fields.push({title: "Name", value: account.get("Name"), short:true});
                attachments.push({color: "#009cdb", fields: fields});
            });
            res.json({text: "Accounts matching '" + req.body.text + "':", attachments: attachments});
        } else {
            res.send("No records");
        }
    });
}

exports.execute = execute;
