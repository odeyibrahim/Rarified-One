-- MOCK CONTENT: placeholder articles so the blog is visible on day one. Edit or delete them in the Private Desk.
insert into posts (slug, title, excerpt, body, cover_url, is_published, published_at) values
('reading-the-lagos-prime-market-2026', 'Reading the Lagos prime market in 2026',
 'Where demand is holding, where pricing has run ahead of fundamentals, and what disciplined capital is doing about it.',
 E'Prime residential demand in Ikoyi, Victoria Island and Lekki remains resilient, but it is no longer uniform. Buyers have become more selective about title, build quality and service-charge discipline.\n\n## Where demand is holding\nCompleted, well-managed stock with clean documentation continues to transact. Off-plan stock is being judged on the developer''s delivery record rather than the brochure.\n\n## Where pricing has run ahead\nSome micro-markets have priced in growth that rents do not yet support. Yield, not headline price, is the better guide.\n\n## What we advise\nBuy on documentation and delivery risk first, location second, finish third. This is placeholder commentary for demonstration.',
 'https://picsum.photos/seed/rarified-market/1200/750.jpg', true, now() - interval '3 days'),
('off-plan-due-diligence-checklist', 'An off-plan due diligence checklist for investors',
 'Seven questions to settle before any deposit leaves your account.',
 E'Off-plan can be an efficient route to a premium asset, provided the structure protects the buyer.\n\n## 1. Title and perfection\nConfirm the root of title, the governor''s consent position and who holds the land.\n\n## 2. Developer track record\nVisit delivered projects. Speak to existing owners and the property manager.\n\n## 3. Payment protection\nPrefer staged payments tied to construction milestones, with funds ring-fenced to the project.\n\nThis is placeholder content for demonstration.',
 'https://picsum.photos/seed/rarified-diligence/1200/750.jpg', true, now() - interval '10 days'),
('structuring-a-joint-venture-development', 'Structuring a joint-venture development that works for both sides',
 'Landowner and developer incentives only align when the agreement says precisely who carries which risk.',
 E'A joint venture succeeds or fails on its allocation of risk, not its headline split.\n\n## Define contribution clearly\nValue the land, the capital and the management input separately, and record how each is measured.\n\n## Agree the exit before the start\nSales waterfall, unsold-unit treatment and dispute resolution should be settled in writing before construction begins.\n\nThis is placeholder content for demonstration.',
 'https://picsum.photos/seed/rarified-jv/1200/750.jpg', true, now() - interval '21 days')
on conflict (slug) do nothing;
