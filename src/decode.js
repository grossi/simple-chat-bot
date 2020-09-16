import download from 'download';
import path from 'path';
import fs from 'fs';
import { parse } from '@fast-csv/parse';

const decode = async stockCode => {
  const cleanFileName = stockCode.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const filePath = `downloadedFiles/${cleanFileName}`;
  const enterPath = path.join(__dirname, filePath);
  const fileUrl = `https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcv&h&e=csv`;
  
  const result = await download(fileUrl, path.join(__dirname, 'downloadedFiles'), { filename: cleanFileName });
  
  let value;

  const end = new Promise(function(resolve, reject) {
    fs.createReadStream(enterPath)
    .pipe(parse())
    .on('error', error => reject(error))
    .on('data', row => value = row[3])
    .on('end', rowCount => resolve());
  });

  await end;

  fs.unlink(enterPath, () => {});

  if( value === 'N/D') {
    return `Stock "${stockCode}" not found.`;
  }

  return `Stock "${stockCode}" quote is $${value} per share.`;
}

export { decode };
