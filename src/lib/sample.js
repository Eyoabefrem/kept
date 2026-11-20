import { uid, isoDay } from './crm.js'

// A believable small business so you can explore with data. All names are made up.
export function sampleData(now = Date.now()) {
  const D = 864e5, id = () => uid()
  const co = { abay: id(), selam: id(), lucy: id() }
  const ct = { hana: id(), dawit: id(), marta: id(), samuel: id(), liya: id(), daniel: id() }
  const company = (key, name, website) => ({ id: co[key], name, website, notes: '', createdAt: now - 90 * D })
  const contact = (key, name, email, phone, role, companyKey, tags, days) => ({ id: ct[key], name, email, phone, role, companyId: companyKey ? co[companyKey] : null, tags, notes: '', createdAt: now - days * D })
  const deal = (title, value, stage, contactKey, companyKey, closeIn, age) => ({ id: id(), title, value, stage, contactId: ct[contactKey], companyId: co[companyKey], expectedClose: isoDay(now + closeIn * D), createdAt: now - age * D, updatedAt: now - age * D, closedAt: stage === 'won' || stage === 'lost' ? now - Math.max(1, age - 2) * D : null })
  const deals = [
    deal('Packaging redesign', 85000, 'lead', 'hana', 'abay', 30, 4),
    deal('Menu printing', 42000, 'contacted', 'dawit', 'selam', 14, 9),
    deal('Brand identity', 160000, 'proposal', 'marta', 'lucy', 21, 12),
    deal('Annual print contract', 240000, 'negotiation', 'daniel', 'selam', 10, 20),
    deal('Website refresh', 120000, 'won', 'liya', 'abay', -5, 18),
    deal('Poster series', 30000, 'won', 'dawit', 'selam', -20, 40),
    deal('Trade show booth', 95000, 'lost', 'samuel', null, -12, 35),
  ]
  const task = (title, dueIn, contactKey, done = false) => ({ id: id(), title, due: dueIn === null ? '' : isoDay(now + dueIn * D), done, contactId: contactKey ? ct[contactKey] : null, dealId: null, createdAt: now - 3 * D })
  const act = (type, text, contactKey, daysAgo) => ({ id: id(), type, text, contactId: ct[contactKey], dealId: null, at: now - daysAgo * D })
  return {
    companies: [company('abay', 'Abay Coffee Traders', 'abaycoffee.example'), company('selam', 'Selam Print House', 'selamprint.example'), company('lucy', 'Lucy Design Studio', 'lucydesign.example')],
    contacts: [
      contact('hana', 'Hana Bekele', 'hana@abaycoffee.example', '+251 911 000 111', 'Owner', 'abay', ['client'], 80),
      contact('dawit', 'Dawit Alemu', 'dawit@selamprint.example', '+251 911 000 222', 'Operations', 'selam', ['client'], 85),
      contact('marta', 'Marta Tesfaye', 'marta@lucydesign.example', '+251 911 000 333', 'Director', 'lucy', ['lead'], 30),
      contact('samuel', 'Samuel Girma', 'samuel@example.com', '+251 911 000 444', 'Freelancer', null, ['partner'], 60),
      contact('liya', 'Liya Mekonnen', 'liya@abaycoffee.example', '+251 911 000 555', 'Marketing', 'abay', ['client'], 70),
      contact('daniel', 'Daniel Kassa', 'daniel@selamprint.example', '+251 911 000 666', 'Manager', 'selam', ['lead'], 45),
    ],
    deals,
    tasks: [task('Send brand identity proposal', -1, 'marta'), task('Call Daniel about the contract', 0, 'daniel'), task('Invoice website refresh', 3, 'liya'), task('Look into a new print supplier', null, null), task('Thank Dawit for the poster order', -8, 'dawit', true)],
    activities: [act('call', 'Talked through scope. She wants three logo directions.', 'marta', 6), act('email', 'Sent the draft contract for review.', 'daniel', 3), act('meeting', 'Visited the shop. Showed paper samples.', 'dawit', 12), act('note', 'Prefers WhatsApp over email.', 'hana', 20), act('call', 'Website launch went well. Very happy.', 'liya', 5), act('email', 'Introduced a possible partner.', 'samuel', 55)],
  }
}
