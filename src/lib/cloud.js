import { supabase } from './supabase'

// Every database call Kept makes. Row-level security means each call only sees your own rows.
const must = ({ data, error }) => { if (error) throw new Error(error.message); return data }

export const pullAll = async () => must(await supabase.from('records').select('kind,id,data,deleted,updated_at')).map((r) => ({ kind: r.kind, id: r.id, data: r.data, deleted: r.deleted, updatedAt: Number(r.updated_at) }))
export async function pushRows(rows) {
  for (let i = 0; i < rows.length; i += 200) {
    must(await supabase.from('records').upsert(rows.slice(i, i + 200).map((r) => ({ kind: r.kind, id: r.id, data: r.data, deleted: r.deleted, updated_at: r.updatedAt })), { onConflict: 'user_id,kind,id' }))
  }
}
export async function ensureLeadForm() {
  let f = must(await supabase.from('lead_forms').select('*').maybeSingle())
  if (!f) { must(await supabase.from('lead_forms').insert({})); f = must(await supabase.from('lead_forms').select('*').maybeSingle()) }
  return f
}
export const setLeadEnabled = async (enabled) => must(await supabase.from('lead_forms').update({ enabled }).not('token', 'is', null))
// Called by visitors who are not logged in. The database function checks the token and files the lead in the owner's contacts.
export const submitLead = async ({ token, name, email, message }) => must(await supabase.rpc('capture_lead', { p_token: token, p_name: name, p_email: email, p_message: message }))
