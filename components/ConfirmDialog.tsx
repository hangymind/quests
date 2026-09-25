"use client";

import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认删除",
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="modal confirm-dialog card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirm-symbol">!</div>
        <div>
          <h2 id="confirm-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="modal-actions">
          <button className="btn" type="button" disabled={loading} onClick={onCancel}>
            取消
          </button>
          <button
            className="btn btn-danger-solid"
            type="button"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "处理中…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
