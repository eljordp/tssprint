import test from 'node:test'
import assert from 'node:assert/strict'
import { migratePassword } from '../server/auth-migration.js'
const base = { id:'fixture-user',email:'fixture@example.test',app_metadata:{tss_migrated_from:'frhxzzlycfhcobslksxg',tss_password_migration_pending:true} }
function setup(user=structuredClone(base),oldError=null,factors=[]) {
 let writes=0,logout=0,updated
 return {get writes(){return writes},get logout(){return logout},get updated(){return updated},args:{email:'fixture@example.test',password:'fixture-password',legacy:{auth:{signInWithPassword:async()=>({error:oldError,data:{user:{id:'fixture-user',factors}}}),signOut:async()=>{logout++}}},destination:{auth:{admin:{getUserById:async()=>({data:{user}}),updateUserById:async(id,payload)=>{assert.equal(id,'fixture-user');writes++;updated=payload;return {error:null}}}}}}}
}
test('verified existing password transfers once to the same restored user',async()=>{const f=setup();assert.equal(await migratePassword(f.args),true);assert.equal(f.writes,1);assert.equal(f.updated.app_metadata.tss_password_migration_pending,false);assert.equal(f.logout,1)})
test('invalid old password never writes destination',async()=>{const f=setup(undefined,new Error('invalid'));assert.equal(await migratePassword(f.args),false);assert.equal(f.writes,0)})
for (const [name,change] of [['used new account',{last_sign_in_at:'2026-09-14'}],['different email',{email:'other@example.test'}],['completed migration',{app_metadata:{...base.app_metadata,tss_password_migration_pending:false}}]]) {
 test(name+' cannot be overwritten using an old password',async()=>{const f=setup({...structuredClone(base),...change});assert.equal(await migratePassword(f.args),false);assert.equal(f.writes,0)})
}
test('MFA accounts require normal recovery; password alone cannot bypass MFA',async()=>{const f=setup(undefined,null,[{status:'verified'}]);assert.equal(await migratePassword(f.args),false);assert.equal(f.writes,0)})
