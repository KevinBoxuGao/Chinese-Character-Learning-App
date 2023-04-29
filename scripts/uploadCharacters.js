const supabase = require('@supabase/supabase-js');
const supabaseUrl = ;
const supabaseKey = ;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

var XLSX = require("xlsx");
var workbook = XLSX.readFile("../data/CharFreq-Modern.xls");
let worksheet = workbook.Sheets[workbook.SheetNames[0]];

var entries = [];

for(let index = 7; index < 9940; index++) {
  const serial_number = worksheet[`A${index}`] ? worksheet[`A${index}`].v : "";
  const character = worksheet[`B${index}`] ? worksheet[`B${index}`].v : "";
  const frequency = worksheet[`C${index}`] ?  worksheet[`C${index}`].v : "";
  const pinyin = worksheet[`E${index}`] ? worksheet[`E${index}`].v : "";
  const english_meaning = worksheet[`F${index}`] ? worksheet[`F${index}`].v : "";
  entries.push({ serial_number, character, frequency, pinyin, english_meaning});
}

var x = ["1"];
x.forEach(async (row) => {
  const { data, error } = await supabaseClient
  .from('characters')
  .insert(entries);
  console.log(data);
  console.log(error);
});
