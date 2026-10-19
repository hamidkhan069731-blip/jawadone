const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const unhex=s=>new Uint8Array(s.match(/.{2}/g).map(x=>parseInt(x,16)));
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function passwordHash(password,salt){const k=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:unhex(salt)},k,256))}
function equal(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
export function store(env){return env.DB||null}
export async function session(req,db){if(!db)return null;const token=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('labledger_session='))?.slice(18);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT u.id,u.name,u.email FROM ll_sessions s JOIN ll_users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>?').bind(await digest(token),Date.now()).first()}
function response(data,status=200,cookie){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}: {})}})}
function cookie(req,token,age=604800){return 'labledger_session='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+age+(new URL(req.url).protocol==='https:'?'; Secure':'')}
export async function auth(req,env){const db=store(env),path=new URL(req.url).pathname;if(!db)return response({error:'Account storage is unavailable. Please retry after server setup.'},503);
 if(path==='/api/auth/me')return response({user:await session(req,db)});
 if(req.method!=='POST')return response({error:'Method not allowed'},405);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return response({error:'Invalid origin'},403);
 if(path==='/api/auth/logout'){const token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)labledger_session=([a-f0-9]{64})/)?.[1];if(token)await db.prepare('DELETE FROM ll_sessions WHERE token_hash=?').bind(await digest(token)).run();return response({ok:true},200,cookie(req,'',0))}
 if(!['/api/auth/register','/api/auth/login'].includes(path))return response({error:'Not found'},404);
 const raw=await req.text();if(raw.length>4096)return response({error:'Request too large'},413);let b;try{b=JSON.parse(raw)}catch{return response({error:'Invalid request'},400)}
 const email=typeof b.email==='string'?b.email.trim().toLowerCase():'',password=b.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<10||password.length>128)return response({error:'Use a valid email and a password of 10–128 characters.'},400);
 const ip=req.headers.get('cf-connecting-ip')||'local';const key=await digest(ip+'|'+email);const stamp=Date.now(),windowStart=stamp-900000;
 await db.prepare('DELETE FROM ll_attempts WHERE stamp<?').bind(windowStart).run();
 const attempts=await db.prepare('SELECT COUNT(*) AS total FROM ll_attempts WHERE attempt_key=? AND stamp>?').bind(key,windowStart).first();
 if(attempts.total>=8)return response({error:'Too many attempts. Try again in 15 minutes.'},429);
 await db.prepare('INSERT INTO ll_attempts(attempt_key,stamp) VALUES(?,?)').bind(key,stamp).run();
 let user=await db.prepare('SELECT * FROM ll_users WHERE email=?').bind(email).first();
 if(path.endsWith('/register')){
 const name=typeof b.name==='string'?b.name.trim():'';if(name.length<2||name.length>80)return response({error:'Enter a name of 2–80 characters.'},400);
 if(user)return response({error:'Unable to create this account. Try signing in.'},409);
 const salt=random(),hash=await passwordHash(password,salt),id=crypto.randomUUID();
 try{await db.prepare('INSERT INTO ll_users(id,name,email,salt,password_hash,created) VALUES(?,?,?,?,?,?)').bind(id,name,email,salt,hash,stamp).run()}catch{return response({error:'Unable to create this account. Try signing in.'},409)}
 user={id,name,email};
 }else{
 const salt=user?.salt||'0'.repeat(64);const computed=await passwordHash(password,salt);
 if(!user||!equal(computed,user.password_hash))return response({error:'Email or password is incorrect.'},401);
 }
 await db.prepare('DELETE FROM ll_attempts WHERE attempt_key=?').bind(key).run();
 await db.prepare('DELETE FROM ll_sessions WHERE expires<?').bind(stamp).run();
 const token=random();await db.prepare('INSERT INTO ll_sessions(token_hash,user_id,expires) VALUES(?,?,?)').bind(await digest(token),user.id,stamp+604800000).run();
 return response({user:{id:user.id,name:user.name,email:user.email}},200,cookie(req,token));
}
