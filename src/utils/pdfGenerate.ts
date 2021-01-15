import puppeteer from 'puppeteer';
import hbs from 'handlebars';
import path from 'path';
import fs from 'fs-extra';
import moment from 'moment';

export const compileTemplate = async (templateName, data) => {
  hbs.registerHelper('findIndex', (key) => {
    const { results } = data;
    const arrayofKeys = Object.keys(results);
    const index = arrayofKeys.findIndex((e) => {
      return e === key;
    });
    return index + 1;
  });
  hbs.registerHelper('dateFormat', (value, format) => {
    return moment(value).format(format);
  });
  console.log(data);

  const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  const html = await fs.readFile(filePath, 'utf-8');
  return hbs.compile(html)(data);
};

export const pdfGenerateByHtml = async (content) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(content);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({
      path: 'results.pdf',
      format: 'A4',
      printBackground: true,
    });
    await browser.close();
    return pdf;
  } catch (err) {
    return err;
  }
};
