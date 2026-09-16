import http from 'node:http';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173),host=process.env.HOST||'0.0.0.0';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml','.ico':'image/x-icon'};
const immutable=new Set(['.png','.jpg','.jpeg','.webp','.mp4','.svg','.ico']);
function safeFile(urlPath){const pathname=decodeURIComponent((urlPath||'/').split('?')[0]);const relative=pathname==='/'?'index.html':pathname.replace(/^[/\\]+/,'');const target=path.resolve(root,relative);const rel=path.relative(root,target);if(rel.startsWith('..')||path.isAbsolute(rel))return null;return target;}
const server=http.createServer(async(req,res)=>{const target=safeFile(req.url);if(!target){res.writeHead(403);return res.end('Forbidden')}try{const stat=await fs.stat(target);if(!stat.isFile())throw new Error('not file');const ext=path.extname(target).toLowerCase();const etag='"'+createHash('sha1').update(`${stat.size}:${stat.mtimeMs}`).digest('hex')+'"';if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end()}res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':immutable.has(ext)?'public, max-age=86400':'no-cache','ETag':etag,'Last-Modified':stat.mtime.toUTCString(),'Accept-Ranges':'bytes'});if(req.method==='HEAD')return res.end();res.end(await fs.readFile(target))}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}});
server.listen(port,host,()=>console.log(`Homeclick local host: http://localhost:${port}`));
