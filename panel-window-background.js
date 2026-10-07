let panelWindowOperation=null,panelWindowRestore;
async function openPanelWindow(){
 if(panelWindowOperation)return panelWindowOperation;
 panelWindowOperation=(async()=>{
  await panelWindowRestore;
  const url=chrome.runtime.getURL('panel-window.html');
  const all=await chrome.windows.getAll({populate:true});
  const existing=all.find(win=>win.tabs?.some(tab=>tab.url===url));
  const win=existing?await chrome.windows.update(existing.id,{focused:true}):await chrome.windows.create({url,type:'popup',width:540,height:860,focused:true});
  await chrome.storage.session.set({companionPanelWindowId:win.id});await chrome.storage.local.set({companionDetachedOpen:true});return {ok:true};
 })().finally(()=>{panelWindowOperation=null;});return panelWindowOperation;
}
chrome.action.onClicked.addListener(()=>{openPanelWindow().catch(()=>{});});
chrome.windows.onRemoved.addListener(async id=>{
 const saved=await chrome.storage.session.get('companionPanelWindowId');if(saved.companionPanelWindowId!==id)return;
 await chrome.storage.session.remove('companionPanelWindowId');await chrome.storage.local.set({companionDetachedOpen:false});
});
async function restorePanelWindowState(){
 const url=chrome.runtime.getURL('panel-window.html');const all=await chrome.windows.getAll({populate:true});const win=all.find(w=>w.tabs?.some(t=>t.url===url));
 if(win)await chrome.storage.session.set({companionPanelWindowId:win.id});else await chrome.storage.session.remove('companionPanelWindowId');
 await chrome.storage.local.set({companionDetachedOpen:!!win});
}
panelWindowRestore=restorePanelWindowState().catch(()=>{});
