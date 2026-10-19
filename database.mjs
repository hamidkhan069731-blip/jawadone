import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
export function database(path='data/labledger.sqlite'){
 if(path!==':memory:')mkdirSync('data',{recursive:true});const db=new DatabaseSync(path);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');db.exec(readFileSync(new URL('../drizzle/0000_accounts.sql',import.meta.url),'utf8'));
 return {prepare(sql){let args=[];return {bind(...v){args=v;return this},async first(){return db.prepare(sql).get(...args)||null},async run(){return db.prepare(sql).run(...args)},async all(){return {results:db.prepare(sql).all(...args)}}}},close(){db.close()}};
}
