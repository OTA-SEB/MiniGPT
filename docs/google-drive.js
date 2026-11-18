// Google Drive appDataFolder backup for OtaAI.
// Requires a publicly configured OAuth 2.0 Web Client ID. NEVER store a client secret.
// Access tokens live only in this JS module; not in localStorage or in exported backups.
const SCOPE='https://www.googleapis.com/auth/drive.appdata';
const NAME='otaai-data.json';
const DRIVE='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
let token='',expiresAt=0,tokenClient=null,configuredId='',pending=null;
const hasToken=()=>!!token&&Date.now()<expiresAt-60000;
export const driveConnected=()=>hasToken();
export function driveDisconnect(){
 token='';expiresAt=0;tokenClient=null;configuredId='';
}
export function getSavedClientId(){
 try{return localStorage.getItem('otaai.googleClientId')||'';}catch{return '';}
}
export function setSavedClientId(clientId){
 const id=String(clientId||'').trim();
 if(id&&!/^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(id))
  throw Error('Enter a valid Google OAuth Web Client ID.');
 if(configuredId&&configuredId!==id)driveDisconnect();
 try{if(id)localStorage.setItem('otaai.googleClientId',id);else localStorage.removeItem('otaai.googleClientId');}catch{}
 return id;
}
export function connectGoogle(clientId){
 const id=String(clientId||getSavedClientId()).trim();
 if(!id)throw Error('Add the Google OAuth Client ID in Settings first.');
 if(!window.google?.accounts?.oauth2?.initTokenClient)
  throw Error('Google sign-in library is still loading or blocked. Please retry.');
 if(pending)return pending;
 if(configuredId!==id){driveDisconnect();configuredId=id;}
 // Must call requestAccessToken from a real user click for the popup to open.
 pending=new Promise((resolve,reject)=>{
  try{
   tokenClient=window.google.accounts.oauth2.initTokenClient({
    client_id:id,scope:SCOPE,
    callback(result){
     const next=pending;pending=null;
     if(result?.error||!result?.access_token){reject(Error(result?.error_description||result?.error||'Google permission denied.'));return;}
     token=result.access_token;expiresAt=Date.now()+Math.max(120,Number(result.expires_in)||3600)*1000;
     resolve(true);
    },
    error_callback(error){pending=null;reject(Error(error?.message||error?.type||'Google sign-in failed.'));}
   });
   tokenClient.requestAccessToken({prompt:'select_account'});
  }catch(error){pending=null;reject(error);}
 });
 return pending;
}
async function request(url,options={}){
 if(!hasToken())throw Error('Google session expired. Connect Google Drive again.');
 const headers=new Headers(options.headers||{});
 headers.set('Authorization','Bearer '+token);
 const response=await fetch(url,{...options,headers,cache:'no-store'});
 if(response.status===401){driveDisconnect();throw Error('Google session expired. Reconnect and try again.');}
 if(!response.ok){
  const details=await response.text().catch(()=>'');
  throw Error('Google Drive HTTP '+response.status+(details?': '+details.slice(0,190):''));
 }
 return response;
}
async function findBackup(){
 const params=new URLSearchParams({
  spaces:'appDataFolder',q:"name = '"+NAME+"' and trashed = false",fields:'nextPageToken,files(id,name,modifiedTime)',pageSize:'100'
 });
 const res=await request(DRIVE+'?'+params);
 const listing=await res.json();
 return (listing.files||[]).sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||'')))[0]||null;
}
export async function googleBackupInfo(){
 const found=await findBackup();
 return found?{exists:true,modifiedTime:found.modifiedTime}:{exists:false};
}
export async function saveToGoogle(snapshot){
 if(!snapshot||snapshot.format!=='otaai-drive-v1')throw Error('Invalid OtaAI data.');
 const json=JSON.stringify(snapshot);
 if(json.length>8*1024*1024)throw Error('Backup is over the 8 MB size limit. Export a local copy.');
 const found=await findBackup();
 if(found){
  const url=UPLOAD+'/'+encodeURIComponent(found.id)+'?uploadType=media&fields=id,modifiedTime';
  await request(url,{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:json});
 }else{
  const boundary='otaai_boundary_'+Math.random().toString(36).slice(2);
  const metadata=JSON.stringify({name:NAME,parents:['appDataFolder'],mimeType:'application/json'});
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+metadata+
    '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+json+
    '\r\n--'+boundary+'--';
  await request(UPLOAD+'?uploadType=multipart&fields=id,modifiedTime',{
   method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
  });
 }
 return {saved:true,bytes:new TextEncoder().encode(json).length};
}
export async function loadFromGoogle(){
 const found=await findBackup();
 if(!found)throw Error('No OtaAI backup found in this Google account.');
 const res=await request(DRIVE+'/'+encodeURIComponent(found.id)+'?alt=media');
 const raw=await res.text();
 if(raw.length>8*1024*1024)throw Error('Cloud backup exceeds the 8 MB limit.');
 let data;
 try{data=JSON.parse(raw);}catch{throw Error('Google backup is not valid JSON.');}
 if(!data||data.format!=='otaai-drive-v1'||!data.data||typeof data.data!=='object')
  throw Error('No valid OtaAI backup in this account.');
 return {snapshot:data,modifiedTime:found.modifiedTime};
}
