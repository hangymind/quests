import crypto from "node:crypto";
import { SurveyStatus } from "@prisma/client";

export const QUESTION_TYPES = [
  ["TEXT", "单行文本"], ["TEXTAREA", "多行文本"], ["SINGLE_CHOICE", "单选"], ["MULTIPLE_CHOICE", "多选"],
  ["SELECT", "下拉选择"], ["RATING", "评分"], ["DATE", "日期"], ["NUMBER", "数字"],
] as const;

export function randomSlug() { return crypto.randomBytes(4).toString("hex"); }
export function hashIdentifier(value: string) { return crypto.createHash("sha256").update(`${process.env.SESSION_SECRET}:${value}`).digest("hex"); }
export function canTransition(from: SurveyStatus, to: SurveyStatus) {
  const allowed: Record<SurveyStatus, SurveyStatus[]> = {
    DRAFT: [SurveyStatus.ACTIVE], ACTIVE: [SurveyStatus.PAUSED, SurveyStatus.STOPPED],
    PAUSED: [SurveyStatus.ACTIVE, SurveyStatus.STOPPED], STOPPED: [],
  };
  return from === to || allowed[from].includes(to);
}

export function isAnswerEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}
