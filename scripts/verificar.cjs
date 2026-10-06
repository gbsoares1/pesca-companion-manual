'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function run(args){const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.js')))run(['--check',path.join(root,file)]);
console.log('Sintaxe dos scripts da extensão: OK.');
for(const file of ['page-integration.cjs','restoration.cjs','chat-submit.cjs','inventory.cjs','fish-response.cjs','owned-tabs.cjs'])run([path.join(root,'tests',file)]);
console.log('Verificação local concluída. Fixtures simuladas; nenhuma ação enviada aos sites.');
