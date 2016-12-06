var JsonDatabase = require('../lib/mock-json-db');
var db = new JsonDatabase();

// //console.log(db.getList("activity", {pageNum:2,pageSize:2}));

// db.add("activity",{id: 51, name:"alex Yu","dd":"dddd"});
// db.add("activity",{id: 52, name:"alex Yu","dd":"dddd"});
// console.log(db.getBy("activity",{id: 51}));

// console.log("remove....");
// db.remove("activity",{id: 51});
// console.log(db.getBy("activity",{id: 51}));

// db.remove("activity",{id: 1});
// db.remove("activity",{id: 52});
// console.log(db.getBy("activity",{id: 1}));

// db.update("activity",{desc: "alex yuyyyyyyyyyyy",subtitle:"hallllllll"}, { id:2});
// console.log(db.getBy("activity",{id: 2}));

// console.log(db.getList("activity"));


//test db.tableProfile["resource"].primaryKey
function removeById(resource, id) {
    var whereCon = {};
    whereCon[db.tableProfile[resource].primaryKey] = id;
    console.log(db.getBy(resource, whereCon));

    console.log("remove....");
    db.remove(resource, whereCon);
    console.log(db.getBy(resource, whereCon));
}

//removeById("product", 2);

function crud(params) {
    console.log("create!");
    console.log(db.create("product", { itemId: 3333, name: "alex Yu", "age": 30}));

    console.log("query by id: 3333!");
    console.log(db.getById("product",3333));

    console.log("update by id: 3333!");
    console.log(db.updateById("product",{itemId: 3333, name: "alex BB", "age": 36}, 3333));
    console.log(db.getById("product",3333));

    console.log("remove by id: 3333!");
    console.log(db.removeById("product", 3333));
    console.log("get Nothing? ...");
    console.log(db.getById("product",3333));
}

crud();
