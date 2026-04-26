// mongosh script to inspect MongoDB contents and verify data
//STEPS:
// 1. Get MongoDB connection string and put in quotes (Not provided in this github) - similar to mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
// 2. open terminal in ../../ of this project 
// 3. run script (this) with mongosh in terminal: 
//      mongosh "your_connection_string" pipeline/mongosh/check_database.js

//NOTE: if mongosh isn't installed, just 
//      brew install mongosh

//EXPECTED OUTPUT:
// Collections:
// ["cancer_trials_raw"]
//
// Document count:
// 1001
//
// Example document:
// {...}
//
// Status counts:
// [
//   {_id: "COMPLETED", count: ...},
//   {_id: "TERMINATED", count: ...}
// ]

const dbRef = db.getSiblingDB("api_studies");

print("Collections:");
printjson(dbRef.getCollectionNames());

print("Document count:");
print(dbRef.cancer_trials_raw.countDocuments());

print("Example document:");
printjson(dbRef.cancer_trials_raw.findOne());

print("Status counts:");
printjson(
  dbRef.cancer_trials_raw.aggregate([
    {
      $group: {
        _id: "$protocolSection.statusModule.overallStatus",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]).toArray()
);