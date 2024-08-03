// src/app/api/extract-page/route.js
export async function GET(request) {
  const url = new URL(request.url);
  const impo = url.searchParams.get('impo');

  if (!impo) {
    return new Response(JSON.stringify({ success: false, message: 'No impo parameter provided' }), { status: 400 });
  }

  const API_KEY = process.env.SCRAPERAPI_KEY; // Store your ScraperAPI key in environment variables
  const targetUrl = `https://hentai.tv/hentai/${impo}`;
  const scraperApiUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

  try {
    // Fetch the HTML from ScraperAPI
    const response = await fetch(scraperApiUrl);
    const html = await response.text();

    // Use a library like Cheerio to parse the HTML
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    // Extract data using Cheerio
    const data = {
      url: $('#aawp iframe').attr('src') || '',
      title: $('#aawp .flex-1 .container .border-b h1').text().trim() || '',
      views: $('#aawp .flex-1 .container .grid .border-b p').text().trim() || '',
      poster: $('#aawp .flex-1 .container .flex aside:first-child img').attr('src') || '',
      cencored: ($('#aawp .flex-1 .container .flex aside:last-child p:first-child a').text().trim() === 'CENSORED') ? 'CENSORED' : '',
      info: {
        brand: $(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cencored === 'CENSORED' ? '2' : '1' }) a`).text().trim() || '',
        brandUploads: $(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cencored === 'CENSORED' ? '3' : '2' }) span:last-child`).text().trim() || '',
        releasedDate: $(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cencored === 'CENSORED' ? '4' : '3' }) span:last-child`).text().trim() || '',
        uploadDate: $(`#aawp .flex-1 .container .flex aside:last-child p:nth-child(${cencored === 'CENSORED' ? '5' : '4' }) span:last-child`).text().trim() || '',
        alternateTitle: $(`#aawp .flex-1 .container .flex aside:last-child div h2 span`).text().trim() || ''
      },
      moreInfo: {
        tags: $('#aawp .flex-1 .container .rounded .btn').map((i, el) => $(el).text().trim()).get(),
        descripOne: $('#aawp .flex-1 .container .rounded .prose p:first-child').text().trim() || '',
        descripTwo: $('#aawp .flex-1 .container .rounded .prose p:last-child').text().trim() || ''
      }
    };

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('Error extracting data from page:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
