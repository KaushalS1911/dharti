const express = require('express');
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parse");
const CsvParser = require("json2csv").Parser
const path = require("path");

const results = [];
const results2 = [];
const result = [];
const csvData = []
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
    VVS: String,
    VS1: String,
    VS2: String,
    SI1: String,
    SI2: String,
    SI3: String,
    I1: String,
    I2: String,
    I3: String,
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

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
    res.render("home.ejs");
});


const upload = multer({storage});

app.post("/sarin", upload.single("info_file"), async (req, res) => {
    const filePath = path.join(__dirname, 'csv', req.file.originalname);
    await User.deleteMany({});

    fs.createReadStream(filePath)
        .pipe(csv.parse({}))
        .on('error', err => console.error(err))
        .on('data', row => {

            results.push(row);

        })
        .on('end', async () => {
            try {
                const categories = ["dia_1", "dia_2", "VVS", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
                const keys = results[0].map((value, index) => `Column${index}`);
                console.log(results[0].length)
                for (let i = 1; i < results[0].length; i++) {
                    const obj = {};
                    const obj1 = {};
                    for (let j = 0; j < categories.length; j++) {
                        obj[categories[j]] = results[j][i];
                    }
                    // for (let j = 0; j < categories.length; j++) {
                    //     obj1[categories[j]] = results[j + 15][i];
                    // }


                    result.push(obj)
                    // result.push(obj1)

                }
                const users = await User.insertMany(result)
                // alert("Data Uploaded Successfully")


                res.send({message: 'File processed successfully'});
            } catch (err) {
                res.status(500).json({error: "Error inserting data", data: results});

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
        const downloadData = await Download.find({});
        const csvData = [];
        for (const data of downloadData) {
            const {
                minDiameter,
                maxDiameter,
                clarity,
                cut,
                color,
                diameter,
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
        const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiametered", "price", "diameter"];
        const csvParser = new CsvParser({csvFields, header: false});
        const csvData2 = csvParser.parse(csvData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment;filename=userData.csv");
        res.status(200).send(csvData2);

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
            const firstFix = convertToObjects(firstFixed);
            const lastFix = convertToObjects(lastFixed);
            data.map(async (item) => {
                if (sortData[count]) {
                    const clarityKey = (item.clarity === "VVS1" || item.clarity === "VVS2") ? "VVS" : item.clarity;

                    if (sortData[count][clarityKey] !== undefined) {
                        priceData.push({
                            ...item,
                            price: Number.isInteger(Number(sortData[count][clarityKey])) ? sortData[count][clarityKey] / 100 : Number(sortData[count][clarityKey]),
                            minDiameter: sortData[count].dia_1,
                            maxDiameter: sortData[count].dia_2
                        });

                        if (item.clarity === "I3") {
                            count++;
                        }
                    } else {
                        console.warn(`Clarity key '${clarityKey}' not found in sortData[${count}]`);
                    }
                } else {
                    console.warn(`sortData[${count}] does not exist`);
                }
            });
            // const a = allData.reduce((acc, obj) => {
            //     data.forEach(( data) => {
            //         if (obj[data.clarity] !== undefined) {
            //             acc.push({...data, diameter: obj[data.clarity=== "VVS1" || data.clarity === "VVS2" ? "VVS" : data.clarity] / 100, minDiameter:obj.dia_1,
            //                 maxDiameter:obj.dia_2 });
            //         }
            //     });
            //     return acc;
            // }, []);
            // data.forEach((dataItem) => {
            //      allData.map((item) => {
            //         // return dataItem.clarity === item[""];
            //     // console.log(dataItem,"dataItem")
            //     // if (matchedData) {
            //         priceData.push({
            //             ...dataItem,
            //             diameter: item[dataItem.clarity === "VVS1" || dataItem.clarity === "VVS2" ? "VVS" : dataItem.clarity] / 100,
            //             minDiameter:item.dia_1,
            //             maxDiameter:item.dia_2
            //             // diameter:dataItem.diameter
            //         });
            //     });
            //     // }
            // });
            await Download.deleteMany({});
            await Download.insertMany(firstFix);
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


