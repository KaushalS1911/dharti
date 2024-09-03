const express = require('express');
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parse");
const CsvParser = require("json2csv").Parser
const path = require("path");
const cors = require("cors")
const results = [];
const result = [];
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "csv");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})


mongoose.connect("mongodb+srv://kaushalsojitra923:iZktC0IzX7KUpxA5@dharti-cluster.lkadaqu.mongodb.net").then(() => {
    console.log("Database connected successfully");
});

const userSchema = new mongoose.Schema({
    dia_1: String,
    dia_2: String,
    VVS1: String,
    VVS2: String,
    VS1: String,
    VS2: String,
    SI1: String,
    SI2: String,
    SI3: String,
    I1: String,
    I2: String,
    I3: String,
    color: String,
});
const csvSchema = new mongoose.Schema({
    minDiameter: String,
    maxDiameter: String,
    price: String,
    clarity: String,
    cut: String,
    color: String,
    diameter: String,
    weight: String,
    field8: String,
    field9: String,
    field10: String,
    field11: String,
    field12: String,
    field13: String,
});
//
const User = mongoose.model("sarin", userSchema);
const Download = mongoose.model("download", csvSchema);
app.use(cors())
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
    res.send("hello from the server");
});


const upload = multer({storage});

// app.post("/sarin", upload.single("info_file"), async (req, res) => {
//     const priceData = []
//     const filePath = path.join(__dirname, 'csv', req.file.originalname);
//     await User.deleteMany({});
//
//     fs.createReadStream(filePath)
//         .pipe(csv.parse({}))
//         .on('error', err => console.error(err))
//         .on('data', row => {
//
//             results.push(row);
//
//         })
//         .on('end', async () => {
//             try {
//                 const categories = ["dia_1", "dia_2", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3", "color"];
//                 const keys = results[0].map((value, index) => `Column${index}`);
//                 for (let i = 1; i < results[0].length; i++) {
//                     // const obj1 = {};
//                     // const obj2 = {};
//                     // const obj3 = {};
//                     // const obj4 = {};
//                     // const obj5 = {};
//                     // const obj6 = {};
//                     // const obj7 = {};
//                     // const obj8 = {};
//                     // const obj9 = {};
//                     // const obj10 = {};
//                     // const obj = {};
//                     // const createObject = (color,row) => {
//                     //     for (let j = 0; j < categories.length; j++) {
//                     //         if (results[j][i] !== "") {
//                     //             obj[categories[j]] = results[(j + row)][i];
//                     //             if (!obj["color"]) {
//                     //                 obj["color"] = color;
//                     //             }
//                     //
//                     //         }
//                     //     }
//                     // }
//                     const createObject = (color, row) => {
//                         const obj = {}; // Create a new object inside the function
//                         for (let j = 0; j < categories.length; j++) {
//                             if (results[j][i] !== "") {
//                                 obj[categories[j]] = results[j + row][i];
//                                 if (!obj["color"]) {
//                                     obj["color"] = color;
//                                 }
//                             }
//                         }
//                         return obj; // Return the newly created object
//                     };
//
//                   result.push(createObject("D",0))
//                   result.push(createObject("E",13))
//                   result.push(createObject("F",26))
//                     const uniqueColors = []; // Array to store unique colors
//
//                      result.filter((data) => {
//                         // Check if the current color is already included in the uniqueColors array
//                         if (!uniqueColors.includes(data.color)) {
//                             uniqueColors.push(data.color); // Add the new color to the array
//                             return true; // Keep the item in the filtered result
//                         }
//                         return false; // Filter out the item if the color is already in the uniqueColors array
//                     });
//
//                     // console.log(colour,"hello")
//                     const dia = ["VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"]
//                     result.sort().map((data) => {
//                         uniqueColors.map((item) => {
//                             dia.map((a) => {
//                                 priceData.push({
//                                     minDiameter: data.dia_1,
//                                     maxDiameter: data.dia_2,
//                                     diameter: Number.isInteger(Number(data[a]))
//                                         ? Number(data[a]) / 100
//                                         : Number(data[a]),
//                                     cut: "EX",
//                                     weight: "Diameter",
//                                     clarity: a,
//                                     color: item
//                                 })
//
//                             })
//                         })
//                     })
//
//                     // createObject("G",39)
//                     // createObject("H",52)
//                     // createObject("I",65)
//                     // createObject("J",78)
//                     // createObject("K",91)
//                     // createObject("L",104)
//                     // createObject("M",117)
//                     // createObject("N",130)
//                     // for (let j = 0; j < categories.length; j++) {
//                     //     if (results[j + 13][i] !== "") {
//                     //         obj1[categories[j]] = results[j + 13][i];
//                     //         if (!obj1["color"]) {
//                     //             obj1["color"] = "E";
//                     //         }
//                     //
//                     //     }
//                     // }
//
//
//                     // result.push(obj)
//                     // result.push(obj1)
//
//                 }
//                 // const users = await User.insertMany(result)
//                 // alert("Data Uploaded Successfully")
//
//
//                 res.send({message: 'File processed successfully',data:priceData});
//             } catch (err) {
//                 res.status(500).json({error: "Error inserting data", data: results});
//
//             }
//         });
// });

app.post("/price-file", upload.single("info_file"), async (req, res) => {
    const priceData = [];
    const uniqueColors = [];
    const results = [];
    const result = [];
    let filter1

    const filePath = path.join(__dirname, "csv", req.file.originalname);
    await User.deleteMany({}); // Clear previous data

    fs.createReadStream(filePath)
        .pipe(csv.parse({skipEmptyLines: false}))
        .on("error", (err) => {
            console.error(err);
            res.status(500).json({error: "Error reading CSV file"});
        })
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", async () => {
            try {
                const categories = [
                    "dia_1",
                    "dia_2",
                    "VVS1",
                    "VVS2",
                    "VS1",
                    "VS2",
                    "SI1",
                    "SI2",
                    "SI3",
                    "I1",
                    "I2",
                    "I3",
                    "color",
                ];

                for (let i = 1; i < results[0].length; i++) {
                    const createObject = (color, row) => {
                        const obj = {};
                        for (let j = 0; j < categories.length; j++) {
                            if (results[j][i]) {
                                obj[categories[j]] = results[j + row][i];
                                if (!obj["color"]) {
                                    obj["color"] = color;
                                }
                            }
                        }
                        return obj;
                    };

                    const colorRows = [
                        { color: "D", offset: 0 },
                        { color: "E", offset: 13 },
                        { color: "F", offset: 26 },
                        { color: "G", offset: 39 },
                        { color: "H", offset: 52 },
                        { color: "I", offset: 65 },
                        { color: "J", offset: 78 },
                        { color: "K", offset: 91 },
                        { color: "L", offset: 104 },
                        { color: "M", offset: 117 },
                        { color: "N", offset: 130 },
                    ];

                    colorRows.forEach((item) => {
                        if (results.length >= item.offset + 12) {
                            result.push(createObject(item.color, item.offset));
                        }
                    });
                }

                filter1 = result.filter((data) => (data.dia_1 !== "" && data.dia_2 !== ""))
                User.insertMany(filter1)
                // filter1.forEach((data) => {
                //     if (!uniqueColors.includes(data.color)) {
                //         uniqueColors.push(data.color);
                //     }
                // });
                // const dia = ["VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
                // filter1.map((data, index) => {
                //     uniqueColors.map((item, ind) => {
                //         dia.map((a, ina) => {
                //             priceData.push({
                //                 minDiameter: data.dia_1,
                //                 maxDiameter: data.dia_2,
                //                 diameter: Number.isInteger(Number(data[a]))
                //                     ? Number(data[a]) / 100
                //                     : Number(data[a]),
                //                 cut: "EX",
                //                 weight: "Diameter",
                //                 clarity: a,
                //                 color: item
                //             })
                //
                //         })
                //     })
                // })
                // const firstFix = [{
                //
                //     cut: "<Rules>",
                // },
                //     {
                //
                //         minDiameter: "E",
                //         maxDiameter: "F",
                //         clarity: "11",
                //         cut: "Colors",
                //         color: "D",
                //         diameter: "G",
                //         weight: "H",
                //         field8: "I",
                //         field9: "J",
                //         field10: "K",
                //         field11: "L",
                //         field12: "M",
                //         field13: "N",
                //     },
                //     {
                //
                //         minDiameter: "VVS2",
                //         maxDiameter: "VS1",
                //         clarity: "10",
                //         cut: "Clarities",
                //         color: "VVS1",
                //         diameter: "VS2",
                //         weight: "SI1",
                //         field8: "SI2",
                //         field9: "SI3",
                //         field10: "I1",
                //         field11: "I2",
                //         field12: "I3",
                //     },
                //     {
                //
                //         clarity: "1",
                //         cut: "Basic Cut Grades",
                //         color: "EX",
                //     },
                //     {
                //
                //         clarity: "47",
                //         cut: "EX Ranges",
                //         color: "Diameter",
                //     }];
                // const lastFix = [{
                //     cut: "</Basic>",
                // },
                //     {
                //         cut: "<Discount>",
                //     },
                //     {
                //         cut: "</Discount>",
                //     }]
                //
                // const a = firstFix.filter((data, ind) => data.minDiameter !== "Diameter" && data.cut !== "Discount Cut Grades" && data.cut !== "</Rules>" && data.cut !== "<Basic>")
                // const b = filter1.map((data, ind) => {
                //     return {cut: `${ind + 1}`, clarity: data.dia_1, color: data.dia_2, minDiameter: "Diameter"}
                // })
                // const c = firstFix.filter((data, ind) => data.cut == "Discount Cut Grades" || data.cut == "</Rules>" || data.cut == "<Basic>")
                // await Download.deleteMany({});
                // await Download.insertMany(a);
                // await Download.insertMany(b);
                // await Download.insertMany(c);
                // await Download.insertMany(priceData);
                // await Download.insertMany(lastFix);

                res.send({message: "File processed successfully", data: filter1});
            } catch (err) {
                console.error("Error during data processing:", err);
                res.status(500).json({error: "Error inserting data"});
            }
        });
});


// app.get("/download", async (req, res) => {
//     try {
//         const downloadData = await Download.find({})
//         console.log(downloadData.length)
//         await downloadData.map((data) => {
//             const {minDiameter, maxDiameter, price, clarity, cut, color} = data
//             csvData.push({cut, clarity, color, minDiameter, maxDiameter, price,})
//         })
//         const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "price"]
//         const csvParser = new CsvParser({csvFields})
//         const csvData2 = csvParser.parse(csvData)
//
//         return res.setHeader("Content-Type", "text/csv").setHeader("Content-Disposition", "attatchment:filename=userData.csv").status(200).send(csvData2)
//     } catch (err) {
//         res.send(err)
//     }
// })
app.get("/download", async (req, res) => {
    try {
        const priceData = [];
        const csvData = [];
        const uniqueColors = [];
        // const downloadData = await Download.find({});
        const filter1 = await User.find({});
        filter1.forEach((data) => {
            if (!uniqueColors.includes(data.color)) {
                uniqueColors.push(data.color);
            }
        });
        const dia = ["VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
        filter1.map((data, index) => {
            uniqueColors.map((item, ind) => {
                dia.map((a, ina) => {
                    priceData.push({
                        minDiameter: data.dia_1,
                        maxDiameter: data.dia_2,
                        diameter: Number.isInteger(Number(data[a]))
                            ? Number(data[a]) / 100
                            : Number(data[a]),
                        cut: "EX",
                        weight: "Diameter",
                        clarity: a,
                        color: item
                    })

                })
            })
        })
        const firstFix = [{

            cut: "<Rules>",
        },
            {

                minDiameter: "E",
                maxDiameter: "F",
                clarity: "11",
                cut: "Colors",
                color: "D",
                diameter: "G",
                weight: "H",
                field8: "I",
                field9: "J",
                field10: "K",
                field11: "L",
                field12: "M",
                field13: "N",
            },
            {

                minDiameter: "VVS2",
                maxDiameter: "VS1",
                clarity: "10",
                cut: "Clarities",
                color: "VVS1",
                diameter: "VS2",
                weight: "SI1",
                field8: "SI2",
                field9: "SI3",
                field10: "I1",
                field11: "I2",
                field12: "I3",
            },
            {

                clarity: "1",
                cut: "Basic Cut Grades",
                color: "EX",
            },
            {

                clarity: "47",
                cut: "EX Ranges",
                color: "Diameter",
            }
            ,{

                "cut": "Discount Cut Grades",
            },
            {

                "cut": "</Rules>",
            },{

                "cut": "<Basic>",
            }];
        const lastFix = [{
            cut: "</Basic>",
        },
            {
                cut: "<Discount>",
            },
            {
                cut: "</Discount>",
            }]

        const a = firstFix.filter((data, ind) => data.minDiameter !== "Diameter" && data.cut !== "Discount Cut Grades" && data.cut !== "</Rules>" && data.cut !== "<Basic>")
        const uniqueDiameterSet = new Set();
        const b = filter1
            .filter((data) => {
                if (!uniqueDiameterSet.has(data.dia_1)) {
                    uniqueDiameterSet.add(data.dia_1);
                    return true;
                }
                return false;
            })
            .map((data, ind) => ({
                cut: `${ind + 1}`,
                clarity: data.dia_1,
                color: data.dia_2,
                minDiameter: "Diameter",
            }));
        const c = firstFix.filter((data, ind) => data.cut == "Discount Cut Grades" || data.cut == "</Rules>" || data.cut == "<Basic>")
        console.log(c)
        const downloadData = [...a, ...b, ...c, ...priceData, ...lastFix];
        for (const data of downloadData) {
            const {
                minDiameter,
                maxDiameter,
                diameter,
                clarity,
                cut,
                color,
                price,
                weight,
                field8,
                field9,
                field10,
                field11,
                field12,
                field13
            } = data;
            csvData.push({
                cut,
                clarity,
                color,
                minDiameter,
                maxDiameter,
                diameter,
                weight,
                field8,
                field9,
                field10,
                field11,
                field12,
                field13
            });
        }
        const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiametered", "diameter", "weight"];
        const csvParser = new CsvParser({csvFields, header: false});
        const csvData2 = csvParser.parse(csvData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment;filename=userData.csv");
        res.status(200).send(csvParser);

    } catch (err) {
        res.status(500).send(err.message);
    }

})
app.post("/dn", upload.single("info_file"), async (req, res) => {

    let results2 = [];
    let count = 0
    let fixedData = []
    const priceData = [];
    const filePath = path.join(__dirname, 'csv', req.file.originalname);
    const cleanNumericField = (value) => {
        return parseFloat(value);
    };
    fs.createReadStream(filePath).pipe(csv.parse({
        // fromLine: 56,
        relax_column_count: true
    })).on('error', err => console.error(err)).on('data', row => {
        if (row[6] == "Diameter") {
            row[3] = cleanNumericField(row[3]);
            row[4] = cleanNumericField(row[4]);
            row[5] = cleanNumericField(row[5]);
            results2.push(row);
        } else {
            fixedData.push(row)
        }
    }).on('end', async () => {
        try {
            // const last = fixedData.filter((item) => item[0] !== "</Basic>" || item[0] !== "<Discount>" || item[0] !== "</Discount>")
            // const last = fixedData.filter((item) => !item.includes("</Basic>")  || !item.includes("<Discount>")|| !item.includes("</Discount>"))
            // console.log(fixedData[55].includes("</Basic>"),"list")
            const firstFixed = fixedData.filter((item) =>
                !item.includes("</Basic>") &&
                !item.includes("<Discount>") &&
                !item.includes("</Discount>")
            );
            const lastFixed = fixedData.filter((item) =>
                item.includes("</Basic>") ||
                item.includes("<Discount>") ||
                item.includes("</Discount>")
            );
            const keys = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "diameter", "weight", "field8", "field9", "field10", "field11", "field12", "field13"];

            const convertToObjects = (data) => {
                return data.map(item => {
                    let obj = {};
                    keys.forEach((key, index) => {
                        obj[key] = item[index];
                    });
                    return obj;
                });
            };
            const allData = await User.find({});
            const sortData = allData.sort()
            // console.log(allData)

            const data = convertToObjects(results2);
            // const dataFix = convertToObjects(fixedData);
            const firstFix = [{

                "cut": "<Rules>",
            },
                {

                    "minDiameter": "E",
                    "maxDiameter": "F",
                    "clarity": "11",
                    "cut": "Colors",
                    "color": "D",
                    "diameter": "G",
                    "weight": "H",
                    "field8": "I",
                    "field9": "J",
                    "field10": "K",
                    "field11": "L",
                    "field12": "M",
                    "field13": "N",
                },
                {

                    "minDiameter": "VVS2",
                    "maxDiameter": "VS1",
                    "clarity": "10",
                    "cut": "Clarities",
                    "color": "VVS1",
                    "diameter": "VS2",
                    "weight": "SI1",
                    "field8": "SI2",
                    "field9": "SI3",
                    "field10": "I1",
                    "field11": "I2",
                    "field12": "I3",
                },
                {

                    "clarity": "1",
                    "cut": "Basic Cut Grades",
                    "color": "EX",
                },
                {

                    "cut": "Discount Cut Grades",
                },
                {

                    "cut": "</Rules>",
                },{

                    "cut": "<Basic>",
                }
                ];
            const lastFix = [{
                "cut": "</Basic>",
            },
                {
                    "cut": "<Discount>",
                },
                {
                    "cut": "</Discount>",
                }]

            // data.map(async (item) => {
            //     if (sortData[count]) {
            //         const clarityKey = item.clarity;
            //
            //         if (sortData[count][clarityKey] !== undefined) {
            //             priceData.push({
            //                 ...item,
            //                 price: Number.isInteger(Number(sortData[count][clarityKey])) ? sortData[count][clarityKey] / 100 : Number(sortData[count][clarityKey]),
            //                 minDiameter: sortData[count].dia_1,
            //                 maxDiameter: sortData[count].dia_2
            //             });
            //
            //             if (item.clarity === "I3" ) {
            //                 count++;
            //             }
            //         } else {
            //             console.warn(`Clarity key '${clarityKey}' not found in sortData[${count}]`);
            //         }
            //     } else {
            //         console.warn(`sortData[${count}] does not exist`);
            //     }
            // });


            let color = firstFix[1]
            const transformData = {
                color: color.color,
                minDiameter: color.minDiameter,
                maxDiameter: color.maxDiameter,
                diameter: color.diameter,
                weight: color.weight,
                field8: color.field8,
                field9: color.field9,
                field10: color.field10,
                field11: color.field11,
                field12: color.field12,
                field13: color.field13
            }
            const colour = Object.values(transformData);
            const dia = ["VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"]
            sortData.map((data, index) => {
                colour.map((item, ind) => {
                    dia.map((a, ina) => {
                        priceData.push({
                            minDiameter: data.dia_1,
                            maxDiameter: data.dia_2,
                            diameter: Number.isInteger(Number(data[a]))
                                ? Number(data[a]) / 100
                                : Number(data[a]),
                            cut: "EX",
                            weight: "Diameter",
                            clarity: a,
                            color: item
                        })

                    })
                })
            })

            const a = firstFix.filter((data, ind) => data.minDiameter !== "Diameter" && data.cut !== "Discount Cut Grades" && data.cut !== "</Rules>" && data.cut !== "<Basic>")
            const b = sortData.map((data, ind) => {
                return {cut: `${ind + 1}`, clarity: data.dia_1, color: data.dia_2, minDiameter: "Diameter"}
            })
            const c = firstFix.filter((data, ind) => data.cut == "Discount Cut Grades" || data.cut == "</Rules>" || data.cut == "<Basic>")
            await Download.deleteMany({});
            await Download.insertMany(a);
            await Download.insertMany(b);
            await Download.insertMany(c);
            await Download.insertMany(priceData);
            await Download.insertMany(lastFix);
            // alert("Data Uploaded Successfully")
            res.status(200).send({message: 'File processed successfully', data: priceData});
        } catch (err) {
            res.status(500).json({error: "Error inserting data"});
        }
    });
});

app.listen(9000, () => {
    console.log("Server is listening on port 9000");
});

// const express = require('express');
// const app = express();
// const multer = require("multer");
// const mongoose = require("mongoose");
// const fs = require("fs");
// const csv = require("csv-parse");
// const CsvParser = require("json2csv").Parser
// const path = require("path");
// const cors = require("cors")
// const results = [];
// const result = [];
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "csv");
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
//
//
// mongoose.connect("mongodb+srv://kaushalsojitra923:iZktC0IzX7KUpxA5@dharti-cluster.lkadaqu.mongodb.net").then(() => {
//     console.log("Database connected successfully");
// });
//
// const userSchema = new mongoose.Schema({
//     dia_1: String,
//     dia_2: String,
//     VVS1: String,
//     VVS2: String,
//     VS1: String,
//     VS2: String,
//     SI1: String,
//     SI2: String,
//     SI3: String,
//     I1: String,
//     I2: String,
//     I3: String,
// });
// const csvSchema = new mongoose.Schema({
//     minDiameter: String,
//     maxDiameter: String,
//     price: String,
//     clarity: String,
//     cut: String,
//     color: String,
//     diameter: String,
//     weight: String,
//     field8: String,
//     field9: String,
//     field10: String,
//     field11: String,
//     field12: String,
//     field13: String,
// });
// //
// const User = mongoose.model("sarin", userSchema);
// const Download = mongoose.model("download", csvSchema);
// app.use(cors())
// app.set("view engine", "ejs");
// app.set("views", path.resolve("./views"));
//
// app.get("/", (req, res) => {
//     res.render("home.ejs");
// });
//
//
// const upload = multer({storage});
//
// app.post("/sarin", upload.single("info_file"), async (req, res) => {
//     const filePath = path.join(__dirname, 'csv', req.file.originalname);
//     await User.deleteMany({});
//
//     fs.createReadStream(filePath)
//         .pipe(csv.parse({}))
//         .on('error', err => console.error(err))
//         .on('data', row => {
//
//             results.push(row);
//
//         })
//         .on('end', async () => {
//             try {
//                 const categories = ["dia_1", "dia_2", "VVS1","VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
//                 const keys = results[0].map((value, index) => `Column${index}`);
//                 console.log(results[0].length)
//                 for (let i = 1; i < results[0].length; i++) {
//                     const obj = {};
//                     const obj1 = {};
//                     for (let j = 0; j < categories.length; j++) {
//                         obj[categories[j]] = results[j][i];
//                     }
//                     // for (let j = 0; j < categories.length; j++) {
//                     //     obj1[categories[j]] = results[j + 15][i];
//                     // }
//
//
//                     result.push(obj)
//                     // result.push(obj1)
//
//                 }
//                 const users = await User.insertMany(result)
//                 // alert("Data Uploaded Successfully")
//
//
//                 res.send({message: 'File processed successfully'});
//             } catch (err) {
//                 res.status(500).json({error: "Error inserting data", data: results});
//
//             }
//         });
// });
// // app.get("/download", async (req, res) => {
// //     try {
// //         const downloadData = await Download.find({})
// //         console.log(downloadData.length)
// //         await downloadData.map((data) => {
// //             const {minDiameter, maxDiameter, price, clarity, cut, color} = data
// //             csvData.push({cut, clarity, color, minDiameter, maxDiameter, price,})
// //         })
// //         const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "price"]
// //         const csvParser = new CsvParser({csvFields})
// //         const csvData2 = csvParser.parse(csvData)
// //
// //         return res.setHeader("Content-Type", "text/csv").setHeader("Content-Disposition", "attatchment:filename=userData.csv").status(200).send(csvData2)
// //     } catch (err) {
// //         res.send(err)
// //     }
// // })
// app.get("/download", async (req, res) => {
//     try {
//         const downloadData = await Download.find({});
//         const csvData = [];
//         for (const data of downloadData) {
//             const {
//                 minDiameter,
//                 maxDiameter,
//                 diameter,
//                 clarity,
//                 cut,
//                 color,
//                 price,
//                 weight,
//                 field8,
//                 field9,
//                 field10,
//                 field11,
//                 field12,
//                 field13
//             } = data;
//             csvData.push({
//                 cut,
//                 clarity,
//                 color,
//                 minDiameter,
//                 maxDiameter,
//                 diameter,
//                 weight,
//                 field8,
//                 field9,
//                 field10,
//                 field11,
//                 field12,
//                 field13
//             });
//         }
//         const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiametered", "diameter", "weight"];
//         const csvParser = new CsvParser({csvFields, header: false});
//         const csvData2 = csvParser.parse(csvData);
//         res.setHeader("Content-Type", "text/csv");
//         res.setHeader("Content-Disposition", "attachment;filename=userData.csv");
//         res.status(200).send(csvData2);
//
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
//
// })
// app.post("/dn", upload.single("info_file"), async (req, res) => {
//
//     let results2 = [];
//     let count = 0
//     let fixedData = []
//     const priceData = [];
//     const filePath = path.join(__dirname, 'csv', req.file.originalname);
//     const cleanNumericField = (value) => {
//         return parseFloat(value);
//     };
//     fs.createReadStream(filePath).pipe(csv.parse({
//         // fromLine: 56,
//         relax_column_count: true
//     })).on('error', err => console.error(err)).on('data', row => {
//         if (row[6] == "Diameter") {
//             row[3] = cleanNumericField(row[3]);
//             row[4] = cleanNumericField(row[4]);
//             row[5] = cleanNumericField(row[5]);
//             results2.push(row);
//         } else {
//             fixedData.push(row)
//         }
//     }).on('end', async () => {
//         try {
//             // const last = fixedData.filter((item) => item[0] !== "</Basic>" || item[0] !== "<Discount>" || item[0] !== "</Discount>")
//             // const last = fixedData.filter((item) => !item.includes("</Basic>")  || !item.includes("<Discount>")|| !item.includes("</Discount>"))
//             // console.log(fixedData[55].includes("</Basic>"),"list")
//             const firstFixed = fixedData.filter((item) =>
//                 !item.includes("</Basic>") &&
//                 !item.includes("<Discount>") &&
//                 !item.includes("</Discount>")
//             );
//             const lastFixed = fixedData.filter((item) =>
//                 item.includes("</Basic>") ||
//                 item.includes("<Discount>") ||
//                 item.includes("</Discount>")
//             );
//             const keys = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "diameter", "weight", "field8", "field9", "field10", "field11", "field12", "field13"];
//
//             const convertToObjects = (data) => {
//                 return data.map(item => {
//                     let obj = {};
//                     keys.forEach((key, index) => {
//                         obj[key] = item[index];
//                     });
//                     return obj;
//                 });
//             };
//             const allData = await User.find({});
//             const sortData = allData.sort()
//             // console.log(allData)
//
//             const data = convertToObjects(results2);
//             // const dataFix = convertToObjects(fixedData);
//             const firstFix = convertToObjects(firstFixed);
//             const lastFix = convertToObjects(lastFixed);
//             // data.map(async (item) => {
//             //     if (sortData[count]) {
//             //         const clarityKey = item.clarity;
//             //
//             //         if (sortData[count][clarityKey] !== undefined) {
//             //             priceData.push({
//             //                 ...item,
//             //                 price: Number.isInteger(Number(sortData[count][clarityKey])) ? sortData[count][clarityKey] / 100 : Number(sortData[count][clarityKey]),
//             //                 minDiameter: sortData[count].dia_1,
//             //                 maxDiameter: sortData[count].dia_2
//             //             });
//             //
//             //             if (item.clarity === "I3" ) {
//             //                 count++;
//             //             }
//             //         } else {
//             //             console.warn(`Clarity key '${clarityKey}' not found in sortData[${count}]`);
//             //         }
//             //     } else {
//             //         console.warn(`sortData[${count}] does not exist`);
//             //     }
//             // });
//
//
//             let color = firstFix[1]
//             const transformData = {
//                 color: color.color,
//                 minDiameter: color.minDiameter,
//                 maxDiameter: color.maxDiameter,
//                 diameter: color.diameter,
//                 weight: color.weight,
//                 field8: color.field8,
//                 field9: color.field9,
//                 field10: color.field10,
//                 field11: color.field11,
//                 field12: color.field12,
//                 field13: color.field13
//             }
//             const colour = Object.values(transformData);
//             const dia = ["VVS1","VVS2","VS1","VS2","SI1","SI2","SI3","I1","I2","I3"]
//             sortData.map((data,index) => {
//                 colour.map((item,ind) => {
//                     dia.map((a,ina)=>{
//                         priceData.push({minDiameter: data.dia_1,maxDiameter: data.dia_2,diameter: Number.isInteger(Number(data[a]))
//                                 ? Number(data[a]) / 100
//                                 : Number(data[a]),cut:"EX",weight:"Diameter",clarity: a,color:item})
//
//                     })
//                 })
//             })
//
//             const a = firstFix.filter((data,ind) => data.minDiameter !== "Diameter" && data.cut !== "Discount Cut Grades" && data.cut !== "</Rules>" && data.cut !== "<Basic>")
//             const b = sortData.map((data,ind) => {
//                 return {cut : `${ind+1}`,clarity:data.dia_1,color:data.dia_2,minDiameter:"Diameter"}
//             })
//             const c = firstFix.filter((data,ind) =>  data.cut == "Discount Cut Grades" || data.cut == "</Rules>" || data.cut == "<Basic>")
//             await Download.deleteMany({});
//             await Download.insertMany(a);
//             await Download.insertMany(b);
//             await Download.insertMany(c);
//             await Download.insertMany(priceData);
//             await Download.insertMany(lastFix);
//             // alert("Data Uploaded Successfully")
//             res.status(200).send({message: 'File processed successfully', data: priceData});
//         } catch (err) {
//             res.status(500).json({error: "Error inserting data"});
//         }
//     });
// });
//
// app.listen(9000, () => {
//     console.log("Server is listening on port 9000");
// });
