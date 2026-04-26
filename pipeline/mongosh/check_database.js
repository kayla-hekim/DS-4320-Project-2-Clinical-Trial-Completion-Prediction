// use api_studies

// print("Collections:")
// show collections

// print("Document count:")
// db.cancer_trials_raw.countDocuments()

// print("Example document:")
// db.cancer_trials_raw.findOne()

// print("Status counts:")
// db.cancer_trials_raw.aggregate([
//   {
//     $group: {
//       _id: "$protocolSection.statusModule.overallStatus",
//       count: { $sum: 1 }
//     }
//   },
//   { $sort: { count: -1 } }
// ])