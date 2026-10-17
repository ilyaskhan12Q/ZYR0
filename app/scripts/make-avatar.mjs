// Converts an Avatar Studio project export into the bible-strong v1 definition
// consumed by @bible-strong/avatar-react.
//
//   node scripts/make-avatar.mjs [input.json] [output.json]
//
// Not part of the build. Re-run it only when the studio file is re-exported.

import { readFileSync, writeFileSync } from 'node:fs';
import { createAvatar } from '@bible-strong/avatar-react';

const input = process.argv[2] ?? process.env.AVATAR_SOURCE ?? '/home/ilyaskhan/Music/avatar-studio-project.json';
const output = process.argv[3] ?? new URL('../src/avatar.avatar.json', import.meta.url);

const project = JSON.parse(readFileSync(input, 'utf8'));
const avatar = project.library.avatars.find((a) => a.id === project.library.activeAvatarId)
  ?? project.library.avatars[0];

if (!avatar) throw new Error('no avatar in library.avatars');
if (!project.expressions?.length) throw new Error('no expressions');
if (!project.sequences?.length) throw new Error('no sequences');

const toExpression = (e) => ({
  head: { x: e.headX, y: e.headY, z: e.headZ },
  eyes: {
    left: { width: e.widthLeft, height: e.heightLeft, x: e.positionXLeft, y: e.positionYLeft, angle: e.leftAngle },
    right: { width: e.widthRight, height: e.heightRight, x: e.positionXRight, y: e.positionYRight, angle: e.rightAngle },
    spacing: e.spacing,
  },
  perspective: e.perspective,
  motion: { eyes: e.eyeMotion, body: e.bodyMotion },
});

const expressions = {};
for (const e of project.expressions) expressions[e.id] = toExpression(e);

// The v1 schema hard-requires `neutral`, and `stop()` resets to it. The studio
// export has no such key, so alias the calmest expression (least head rotation).
const neutralSource = [...project.expressions].sort(
  (a, b) =>
    Math.abs(a.headX) + Math.abs(a.headY) + Math.abs(a.headZ) -
    (Math.abs(b.headX) + Math.abs(b.headY) + Math.abs(b.headZ))
)[0];
expressions.neutral = toExpression(neutralSource);

const animations = {};
const animationOrder = [];
for (const s of project.sequences) {
  const metadata = {};
  if (s.name) metadata.label = s.name;
  if (s.description) metadata.description = s.description;
  if (s.group) metadata.group = s.group;

  animations[s.id] = {
    playbackMode: s.playbackMode,
    steps: s.steps.map((step) => ({
      expression: step.expressionId,
      holdMs: step.holdMs,
      transitionMs: step.transitionMs,
      transition: step.transition,
    })),
    blink: s.blink,
    ...(Object.keys(metadata).length ? { metadata } : {}),
  };
  animationOrder.push(s.id);
}

const definition = {
  schema: 'bible-strong/avatar-definition',
  schemaVersion: 1,
  name: avatar.name,
  body: avatar.body,
  colors: avatar.colors,
  expressions,
  expressionOrder: ['neutral', ...project.expressions.map((e) => e.id)],
  animations,
  animationOrder,
};

// Throws with the first schema violation if anything is off.
createAvatar(definition);

writeFileSync(output, JSON.stringify(definition));
console.log(
  `ok -> ${output.pathname}\n` +
    `  avatar      ${definition.name}\n` +
    `  expressions ${Object.keys(expressions).length}\n` +
    `  animations  ${animationOrder.length} (${animationOrder.join(', ')})\n` +
    `  neutral     ${neutralSource.id}`
);
