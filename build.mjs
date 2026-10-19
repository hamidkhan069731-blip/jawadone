import fs from 'node:fs/promises';
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});await fs.cp('worker','dist/server',{recursive:true});await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');console.log('Worker build ready.');
