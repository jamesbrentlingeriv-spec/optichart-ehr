import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DialogType = "confirm" | "prompt" | "alert";

interface ThemedDialogProps {
  open: boolean;
  type: DialogType;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export default function ThemedDialog({
  open,
  type,
  title,
  message,
  defaultValue = "",
  placeholder = "",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ThemedDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="bg-white rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-black px-5 py-4 flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-tight">
                {title}
              </h2>
              <button
                onClick={onCancel}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{message}</p>

              {type === "prompt" && (
                <input
                  type="text"
                  autoFocus
                  defaultValue={defaultValue}
                  placeholder={placeholder}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-black outline-none focus:border-black transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onConfirm((e.target as HTMLInputElement).value);
                    }
                  }}
                  id="themed-dialog-input"
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              {type !== "alert" && (
                <button
                  onClick={onCancel}
                  className="flex-1 bg-white text-black border border-gray-300 font-black uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-gray-100 transition-all"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                onClick={() => {
                  if (type === "prompt") {
                    const input = document.getElementById(
                      "themed-dialog-input",
                    ) as HTMLInputElement;
                    onConfirm(input?.value || defaultValue);
                  } else {
                    onConfirm();
                  }
                }}
                className="flex-1 bg-black text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-lg hover:opacity-90 transition-all"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}