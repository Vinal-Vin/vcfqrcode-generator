const axios = require('axios');
const fs = require('fs');
const request = require('request');
const csv = require('fast-csv');

//Read data from CSV file
const filepath = "../team.csv"
let data = [];
fs.createReadStream(filepath)
.pipe(csv.parse({ headers: true }))
.on('error', (error) => {
    console.error(error)
})
.on('data', (row) => {
    data.push(row)
})
.on('end', () => {
    data.forEach(key => {
        
        let filename = `${key['FIRSTNAME']} ${key['LASTNAME']}`;
        let vCardData = `BEGIN:VCARD\nVERSION:3.0\nN:${key['LASTNAME']};${key['FIRSTNAME']}\nFN:${key['FIRSTNAME']} ${key['LASTNAME']}\nTITLE:${key['TITLE']}\nORG:${key['ORG']}\nURL:${key['WEBSITE']}\nEMAIL;TYPE=INTERNET:${key['EMAIL']}\nTEL;TYPE=voice,cell,pref:${key['PHONE']}\nEND:VCARD`
        
        doPostRequest(vCardData, filename);
    })
});

/* download vcard qrcode from qrcode-monkey api (working as expeceted) -------------- START  */

const baseApi = 'https://api.qrcode-monkey.com//qr/custom';

async function doPostRequest(vCardData, filename) {
    let payload = {
        // "data":'BEGIN:VCARD\nVERSION:3.0\nN:Kumar;Vinal\nFN:Vinal Kumar\nTITLE:Developer\nORG:ACTON\nURL:https://www.linkedin.com/in/vinal-kumar-655259ab/\nEMAIL;TYPE=INTERNET:vikumar@actonfiji.com\nTEL;TYPE=voice,cell,pref:8676008\nEND:VCARD',
        "data": vCardData,
        "size": 2000,
        "download":'true',
        "file":'png'
    }

    let res = await axios.post(`${baseApi}`, payload);
    let data = JSON.parse(res.config.data)
    let query = formulateQuery(baseApi, data);

    var download = function(uri, filename, callback){
        request.head(uri, () => {
          console.log('content-type:', res.headers['content-type']);
          console.log('content-length:', res.headers['content-length']);
      
          request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
      };
      
      download(query, `./exports/${filename}.png`, function(){
        console.log(`Downloading ${filename}.png ------> Done`);
      });
}

function formulateQuery(baseAPI, data){
    let dataValue = encodeURIComponent(data.data);
    let download = data.download;
    let file = data.file;
    let size = data.size;
    // let config = encodeURIComponent(data.config).replace(/%20/g, "").trim();
    let config = '%7B%22body%22%3A%22circular%22%2C%22eye%22%3A%22frame12%22%2C%22eyeBall%22%3A%22ball14%22%2C%22erf1%22%3A%5B%5D%2C%22erf2%22%3A%5B%5D%2C%22erf3%22%3A%5B%5D%2C%22brf1%22%3A%5B%5D%2C%22brf2%22%3A%5B%5D%2C%22brf3%22%3A%5B%5D%2C%22bodyColor%22%3A%22%23000000%22%2C%22bgColor%22%3A%22%23FFFFFF%22%2C%22eye1Color%22%3A%22%23000000%22%2C%22eye2Color%22%3A%22%23000000%22%2C%22eye3Color%22%3A%22%23000000%22%2C%22eyeBall1Color%22%3A%22%23000000%22%2C%22eyeBall2Color%22%3A%22%23000000%22%2C%22eyeBall3Color%22%3A%22%23000000%22%2C%22gradientColor1%22%3A%22%22%2C%22gradientColor2%22%3A%22%22%2C%22gradientType%22%3A%22linear%22%2C%22gradientOnEyes%22%3A%22true%22%2C%22logo%22%3A%2212b7fe17aaeb7a1067991794c26399ff3800af24.png%22%2C%22logoMode%22%3A%22clean%22%7D';
    
    return `${baseAPI}?download=${download}&file=${file}&data=${dataValue}&size=${size}&config=${config}`
}

/* download vcard qrcode from qrcode-monkey api (working as expeceted) -------------- START  */
