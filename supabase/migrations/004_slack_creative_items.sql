-- New Creative AI backlog items discovered from #ai-designer and #creativeai-gtm Slack channels
-- Source: Slack audit 2026-05-23, covering Apr 23 – May 23 2026
-- Run AFTER 003_provenance_columns.sql

INSERT INTO backlog_items (
  title, detail, module, owner, priority, status,
  customers, has_linear, suggested_due, roadmap_quarter, roadmap_notes,
  workflow, manually_overridden, source, requested_by, requested_at, request_context
)
VALUES

-- 1. Parallel AI edits
(
  'Parallel AI edits across multiple creatives',
  'Currently AI Edit only works on 1 creative at a time. Support parallel batch editing so multiple creatives can be refined simultaneously.',
  'creative', 'gayathri', 'high', 'new',
  '{}', false, NULL, 'Q3 2026', NULL,
  '{}', false, 'slack', 'Dhanush Kumar', '2026-05-18',
  'Slack #ai-designer: "Currently we''re able to use AI Edit for 1 creative at a time only, if we''re able to add parallel edits that''ll be really helpful."'
),

-- 2. Brand guide upload size limit
(
  'Support large brand guide uploads (>200MB)',
  'Brand guides from enterprise clients frequently exceed the current 200MB upload limit. Need a workaround — chunked upload, Google Drive link input, or increased limit.',
  'creative', 'gayathri', 'high', 'new',
  '{}', false, NULL, 'Q2 2026', 'Blocking Bata, Dabur onboarding.',
  '{}', false, 'slack', 'Dhanush Kumar', '2026-05-17',
  'Slack #ai-designer: "Facing issue while uploading the brand guide (file size is larger 200MB)"'
),

-- 3. Skip concept selection for batch generation
(
  'Skip concept selection step for batch creative generation',
  'When generating 10+ creatives with unique concepts, users should be able to review and proceed instead of selecting each concept one by one.',
  'creative', 'gayathri', 'med', 'new',
  '{}', false, NULL, 'Q3 2026', NULL,
  '{}', false, 'slack', 'Dhanush Kumar', '2026-05-12',
  'Slack #ai-designer: "If i want to generate 10 creatives with unique concepts, we can just review and proceed instead of selecting the concepts one by one."'
),

-- 4. Multi-scene storyboard to video workflow
(
  'Multi-scene storyboard to video generation workflow',
  'Support generating multi-grid storyboard scenes directly as video frames for Seedance. Options: (1) multi-grid frames per scene, (2) separate frames combined into grid before Seedance, (3) image agent iteration then video agent. Requires UX changes.',
  'creative', 'gayathri', 'high', 'new',
  '{}', false, NULL, 'Q2 2026', 'Adrian has POC with single grid → Seedance. Multi-scene UX design needed.',
  '{}', false, 'slack', 'Adrian Sajjan', '2026-05-19',
  'Slack #ai-designer: Adrian''s design doc on multi-grid storyboard options for Seedance video generation.'
),

-- 5. Auto-switch video provider when primary is down
(
  'Auto-switch video provider on failure (Seedance ↔ Kling fallback)',
  'When Seedance or another video provider is down (502 / timeout), automatically fall back to Kling or next available provider without manual intervention.',
  'creative', 'gayathri', 'med', 'new',
  '{}', false, NULL, 'Q3 2026', NULL,
  '{}', false, 'slack', 'AB Siddique', '2026-05-15',
  'Slack #ai-designer: "we should switch automatically.. plan for it" (after Seedance 502 outage)'
),

-- 6. Recording + Zip download for creative sets
(
  'Recording and Zip download for creative batch outputs',
  'Allow bulk download of a creative set as a zip file, plus screen recording support — similar to the existing Chola setup.',
  'creative', 'gayathri', 'med', 'new',
  '{}', false, NULL, 'Q3 2026', NULL,
  '{}', false, 'slack', 'Sundar Natesan', '2026-05-08',
  'Slack #ai-designer: "Can we have recording & Zip? Similar to Chola"'
),

-- 7. Celebrity face creatives without shoot
(
  'Generate brand celebrity creatives using face assets (no shoot required)',
  'Ability to create video and image creatives featuring brand celebrities using only face/asset reference images — no physical shoot needed. Requested by Piramal Consumer Healthcare prospect.',
  'creative', 'gayathri', 'high', 'new',
  '{}', false, NULL, 'Q3 2026', 'Strong prospect demand. Piramal explicitly listed this as a key requirement.',
  '{}', false, 'gtm', 'Piramal Consumer Healthcare (Debojyoti Srimani)', '2026-05-20',
  'Slack #creativeai-gtm: Piramal prospect listed "creatives and videos featuring brand celebrities without requiring an actual shoot, using only the celebrity''s face/assets" as top requirement.'
),

-- 8. UGC video generation at scale (1000+/month)
(
  'UGC-style video generation at scale (1000+ videos/month)',
  'Generate authentic-feeling UGC videos at high volume for fashion/retail use cases. Multiple prospects asking for this — LuLu Group (fashion UGC), Ozi (1000+ videos/month). Needs to feel authentic, not obviously AI.',
  'creative', 'gayathri', 'high', 'new',
  '{}', false, NULL, 'Q3 2026', 'Multiple prospects converging on this need. LuLu Group (fashion UGC), Ozi (1000+/mo).',
  '{}', false, 'gtm', 'LuLu Group India / Ozi', '2026-05-14',
  'Slack #creativeai-gtm + #ai-designer: LuLu Group specifically needs UGC for fashion segment. Ozi wants 1000+ videos/month. Both reference Sora/Seedance/Higgsfield as benchmarks.'
)

ON CONFLICT DO NOTHING;
