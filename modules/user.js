var org = require('./auth').org,

    USER_TOKEN = process.env.USER_TOKEN;

function execute(req, res) {

    if (req.body.token != USER_TOKEN) {
        res.send("Invalid token");
        return;
    }

    var q = "SELECT Full_Name_Text__c, Profile.name, Title, Email FROM User WHERE Full_Name_Text__c LIKE '%" + req.body.text + "%' LIMIT 10";
    org.query({query: q}, function(err, resp) {
        if (err) {
            console.error(err);
            res.send("An error as occurred");
            return;
        }
        if (resp.records && resp.records.length>0) {
            var users = resp.records;
            var attachments = [];
            users.forEach(function(user) {
                var fields = [];
                fields.push({title: "Name", value: user.get("Full_Name_Text__c"), short:true});
                fields.push({title: "Title", value: user.get("Title"), short:true});
                fields.push({title: "Email", value: user.get("Email"), short:true});
                fields.push({title: "Email", value: user.get("Profile.name"), short:true});
                
                attachments.push({color: "#32CD32", fields: fields});
            });
            res.json({text: "Users matching '" + req.body.text + "':", attachments: attachments});
        } else {
            res.send("No records");
        }
    });
}

exports.execute = execute;
