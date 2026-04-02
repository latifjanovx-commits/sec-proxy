const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;

function fetchSEC(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.sec.gov',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'InsiderBot admin@gmail.com',
        'Accept': 'application/xml, application/json'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  
  if (req.url === '/form4') {
    try {
      const result = await fetchSEC('/cgi-bin/browse-edgar?action=getcurrent&type=4&dateb=&owner=include&count=40&search_text=&output=atom');
      res.writeHead(result.status, {'Content-Type': 'application/xml'});
      res.end(result.data);
    } catch(e) {
      res.writeHead(500);
      res.end('Error: ' + e.message);
    }
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('SEC Proxy running on port ' + PORT);
});
setInterval(function() {
  https.get("https://sec-proxy-sw0n.onrender.com/health", function(res) {
    console.log("Keep-alive: " + res.statusCode);
  }).on('error', function(e) {});
}, 10 * 60 * 1000);
