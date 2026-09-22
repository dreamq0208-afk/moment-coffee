export function editMoods(swapped, edits) {
  const result = swapped ? ["想换个口味"] : [];
  for (const edit of edits) if (!result.includes(edit.mood)) result.push(edit.mood);
  return result;
}

export function recordEdit(edits, draft, baseDraft, category, value, mood) {
  const next = edits.filter((edit) => !(edit.cat === category && (category !== "tops" || edit.val === value)));
  if (category === "tops") {
    if (draft.tops.has(value) && !baseDraft.tops.has(value)) next.push({ cat: category, val: value, mood });
  } else if (draft[category] !== baseDraft[category]) next.push({ cat: category, val: value, mood });
  return next;
}

export function applyOption(draft, category, option) {
  if (category === "tops") draft.tops.has(option.v) ? draft.tops.delete(option.v) : draft.tops.add(option.v);
  else draft[category] = option.v;
  if (category === "milk" && option.v !== "none" && draft.base === "orange") {
    draft.base = "esp";
    draft.tops.delete("orange");
  }
  if (["milk", "strength", "tops"].includes(category)) {
    draft.real = null;
    draft.key = "custom";
  }
}
