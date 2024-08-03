// src/app/api/extract-page/route.js
import { chromium } from 'playwright';

export async function GET(request) {
  const url = new URL(request.url);
  const impo = url.searchParams.get('impo');

  if (!impo) {
    return new Response(JSON.stringify({ success: false, message: 'No impo parameter provided' }), { status: 400 });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Block resources like images, stylesheets, and fonts to improve performance
    await page.route('**/*', (route) => {
      const request = route.request();
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(`https://hentai.tv/hentai/${impo}`, { waitUntil: 'networkidle' });

    // Check if the ad is present and click the close button
    const adSelector = '#aawp .flex-1 .container button';
    if (await page.$(adSelector)) {
      await page.click(adSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle' });
    }

    // Extract the data
    const data = await page.evaluate(() => {
      const url = document.querySelector('#aawp iframe')?.src || '';
      const title = document.querySelector('#aawp .flex-1 .container .border-b h1')?.innerText.trim() || '';
      const views = document.querySelector('#aawp .flex-1 .container .grid .border-b p')?.innerText.trim() || '';
      const poster = document.querySelector('#aawp .flex-1 .container .flex aside:first-child img')?.src || '';

      const cenco = document.querySelector('#aawp .flex-1 .container .flex aside:last-child p:first-child a')?.innerText.trim() || '';
      const cencored = cenco === 'CENSORED' ? cenco : '';
      
      const info = {
        brand: document.querySelector(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cenco === 'CENSORED' ? '2' : '1' }) a`)?.innerText.trim() || '',
        brandUploads: document.querySelector(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cenco === 'CENSORED' ? '3' : '2' }) span:last-child`)?.innerText.trim() || '',
        releasedDate: document.querySelector(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cenco === 'CENSORED' ? '4' : '3' }) span:last-child`)?.innerText.trim() || '',
        uploadDate: document.querySelector(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cenco === 'CENSORED' ? '5' : '4' }) span:last-child`)?.innerText.trim() || '',
        alternateTitle: document.querySelector(`#aawp .flex-1 .container .flex aside:last-child div h2 span`)?.innerText.trim() || ''
      };
      
      const moreInfo = {
        tags: Array.from(document.querySelectorAll('#aawp .flex-1 .container .rounded .btn')).map(el => el.innerText.trim()),
        descripOne: document.querySelector('#aawp .flex-1 .container .rounded .prose p:first-child')?.innerText.trim() || '',
        descripTwo: document.querySelector('#aawp .flex-1 .container .rounded .prose p:last-child')?.innerText.trim() || ''
      };

      return { url, title, views, poster, cencored, info, moreInfo };
    });

    await browser.close();
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error extracting data from page:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
