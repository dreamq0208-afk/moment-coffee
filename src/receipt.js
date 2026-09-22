import html2canvas from "html2canvas";
import { MILK_TEXT, SWEETS } from "./data.js";

const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const pad = (value) => String(value).padStart(2, "0");
const escapeHtml = (value) => String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

export function renderReceipt(element, order, model, copy, moods, helpers) {
  const date = order.time;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 864e5);
  element.innerHTML = `
    <div class="r-head"><b>此刻咖啡馆</b>${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${weekdays[date.getDay()]} ${pad(date.getHours())}:${pad(date.getMinutes())}<br>单号 No.${String(dayOfYear).padStart(3, "0")}${pad(date.getMinutes())}</div>
    <hr class="r-cut">
    <div class="r-row"><span class="r-name">${escapeHtml(copy.name)}</span><span>×1</span></div>
    <div class="r-sub">${escapeHtml(helpers.realName(model))}，${model.temp}，${SWEETS[model.sweet]}</div>
    <div class="r-sub">${helpers.strengthText(model)}，${MILK_TEXT[model.milk]}</div>
    ${model.tops.size ? `<div class="r-sub">加 ${escapeHtml(helpers.topsLine(model))}</div>` : ""}
    <hr class="r-cut">
    <div class="r-row"><span>电量</span><span>${"■".repeat(order.energy)}${"□".repeat(5 - order.energy)} ${order.energyText}</span></div>
    <div class="r-row"><span>此刻</span><span>${escapeHtml(order.feelings.join("、"))}</span></div>
    ${moods.length ? `<div class="r-row"><span></span><span>${escapeHtml(moods.filter((mood) => mood !== "想换个口味").join("、"))}</span></div>` : ""}
    ${order.say ? `<div class="r-sub receipt-say">“${escapeHtml(order.say)}”</div>` : ""}
    <hr class="r-cut">
    <div class="r-note">${escapeHtml(copy.note.join("\n"))}</div>
    <hr class="r-cut">
    <div class="r-foot">谢谢光临，明天见</div>`;
}

export async function saveReceipt(element, filename) {
  const canvas = await html2canvas(element, { scale: Math.min(3, window.devicePixelRatio || 2), backgroundColor: null, useCORS: true });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("image-failed");
  const url = URL.createObjectURL(blob);
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile) {
    const overlay = document.getElementById("saveOverlay");
    const image = document.getElementById("savedReceipt");
    image.src = url;
    overlay.hidden = false;
    overlay.dataset.objectUrl = url;
    return "preview";
  }
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "download";
}
