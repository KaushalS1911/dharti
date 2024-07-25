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


mongoose.connect("mongodb+srv://kaushalsojitra923:iZktC0IzX7KUpxA5@dharti-cluster.lkadaqu.mongodb.net/").then(() => {
    console.log("Database connected successfully");
});
//
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
    color: String
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

app.post("/sarin", upload.single("info-file"), async (req, res) => {
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

                for (let i = 1; i < results[0].length; i++) {
                    const obj = {};
                    const obj1 = {};

                    for (let j = 0; j < categories.length; j++) {
                        obj[categories[j]] = results[j + 2][i];
                    }
                    for (let j = 0; j < categories.length; j++) {
                        obj1[categories[j]] = results[j + 15][i];
                    }

                    result.push(obj)
                    result.push(obj1)

                }
                const users = await User.insertMany(result)
                // alert("Data Uploaded Successfully")


                res.send({message: 'File processed successfully'});
            } catch (err) {
                res.status(500).json({error: "Error inserting data"});

            }
        });
});
app.get("/download", async (req, res) => {
    try {
        const downloadData = await Download.find({})
        await downloadData.map((data) => {
            const {minDiameter, maxDiameter, price, clarity, cut, color} = data
            csvData.push({cut, clarity, color, minDiameter, maxDiameter, price,})
        })
        const csvFields = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "price"]
        const csvParser = new CsvParser({csvFields})
        const csvData2 = csvParser.parse(csvData)

        return res.setHeader("Content-Type", "text/csv").setHeader("Content-Disposition", "attatchment:filename=userData.csv").status(200).send(csvData2)
    } catch (err) {
        res.send(err)
    }
})
app.post("/dn", upload.single("info-file"), async (req, res) => {
    let results2 = [];
    const priceData = [];
    const filePath = path.join(__dirname, 'csv', req.file.originalname);
    const cleanNumericField = (value) => {
        return parseFloat(value);
    };
    fs.createReadStream(filePath).pipe(csv.parse({
        fromLine: 56,
        relax_column_count: true
    })).on('error', err => console.error(err)).on('data', row => {
        row[3] = cleanNumericField(row[3]);
        row[4] = cleanNumericField(row[4]);
        row[5] = cleanNumericField(row[5]);
        results2.push(row);
    }).on('end', async () => {
        try {
            const keys = ["cut", "clarity", "color", "minDiameter", "maxDiameter", "weight", "dimension", "field8", "field9", "field10", "field11", "field12", "field13"];
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
            const data = convertToObjects(results2);
            data.forEach((dataItem) => {
                const matchedData = allData.find((item) => {
                    return dataItem.minDiameter <= Number(item.dia_1) && dataItem.maxDiameter >= Number(item.dia_2);
                });
                if (matchedData) {
                    priceData.push({
                        ...dataItem,
                        price: matchedData[dataItem.clarity === "VVS1" || dataItem.clarity === "VVS2" ? "VVS" : dataItem.clarity]
                    });
                }
            });
            await Download.deleteMany({});
            await Download.insertMany(priceData);
            // alert("Data Uploaded Successfully")
            res.status(200).send({message: 'File processed successfully'});
        } catch (err) {
            res.status(500).json({error: "Error inserting data"});
        }
    });
});

app.listen(9000, () => {
    console.log("Server is listening on port 9000");
});


