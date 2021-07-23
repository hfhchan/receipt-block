const puppeteer = require("puppeteer");
const fs = require('fs');

const generateData = (prefix, numPages) => {
	let data = [];
	for (let i = 0; i < numPages; i++) {
		if (prefix) {
			let count1 = (i * 3 + 1).toString().padStart(3, '0');
			let count2 = (i * 3 + 2).toString().padStart(3, '0');
			let count3 = (i * 3 + 3).toString().padStart(3, '0');
			data.push([
				`${prefix}${count1}`,
				`${prefix}${count2}`,
				`${prefix}${count3}`,
			]);
		} else {
			data.push(["", "", ""])
		}
	}
	return data;
}

const generatePage = (data) => {
	let html = `<!doctype html>
	<style>
	@page {
		margin: 1cm;
	}
	body{margin:0;padding:0;font-family:Arial, Helvetica, sans-serif}
	table{border:1px solid #000;border-collapse:collapse;width:27.7cm;height:19cm;box-sizing:border-box;page-break-inside:avoid}
	td{border:1px solid #000;padding:.2cm}
	.serial{height:2cm}
	.serial td{vertical-align:middle;text-align:center;font-size:28px}
	.amount{height:2cm}
	.amount td{vertical-align:bottom;font-size:28px}
	</style>
	<body>`;
	
	data.forEach(content => {
		html += `<table>
		<tr><td><td><td></tr>
		<tr class=serial><td>${content[0]}<td>${content[1]}<td>${content[2]}</tr>
		<tr class=amount><td>$<td>$<td>$</tr>
	</table>`;
	});

	return html;
}

// Empty
let genericHTML = generatePage(generateData("", 1));
fs.writeFileSync("./output/generic.html", genericHTML);

// Wellcome for 2021-Jul
let wellcomeHTML = generatePage(generateData("OTH-WLC-2107", 30));
fs.writeFileSync("./output/wellcome-202107.html", wellcomeHTML);

// Export to PDF
(async() => {

	const browser = await puppeteer.launch({headless: true});
	const webPage = await browser.newPage();

	const paths = [
		"./output/generic.html",
		"./output/wellcome-202107.html"
	];

	for (const path of paths) {
		const dataURI = `data:text/html;base64,` + fs.readFileSync(path).toString('base64');

		await webPage.goto(dataURI, {
			waitUntil: "networkidle0"
		});

		const pdf = await webPage.pdf({
			printBackground: true,
			format: "A4",
			landscape: true,
			margin: {
				top: "1cm",
				bottom: "1cm",
				left: "1cm",
				right: "1cm"
			}
		});

		fs.writeFileSync(path.replace('.html', '.pdf'), pdf);
	}

	await browser.close();

})();