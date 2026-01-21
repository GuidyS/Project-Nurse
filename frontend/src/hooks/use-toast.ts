import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/**
 * จำนวน toast สูงสุดที่แสดงพร้อมกัน
 */
const TOAST_LIMIT = 1;

/**
 * ระยะเวลาก่อน toast จะถูกลบออก (milliseconds)
 */
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

/**
 * genId - สร้าง unique ID สำหรับ toast
 * 
 * หน้าที่:
 * - สร้าง ID ที่ไม่ซ้ำกันสำหรับแต่ละ toast
 * - ใช้ counter ที่เพิ่มขึ้นเรื่อยๆ และ wrap around เมื่อถึง MAX_SAFE_INTEGER
 * 
 * @returns {string} - Unique ID string
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * addToRemoveQueue - เพิ่ม toast เข้า queue เพื่อลบออกหลังจาก delay
 * 
 * หน้าที่:
 * - จัดการ timer สำหรับลบ toast ออกอัตโนมัติหลังจากเวลาผ่านไป
 * - ป้องกันการสร้าง timer ซ้ำสำหรับ toast เดียวกัน
 * 
 * @param {string} toastId - ID ของ toast ที่ต้องการลบ
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * reducer - Reducer function สำหรับจัดการ toast state
 * 
 * หน้าที่:
 * - จัดการ state ของ toast ตาม action type
 * - ใช้ Redux pattern สำหรับ state management
 * 
 * Actions:
 * - ADD_TOAST: เพิ่ม toast ใหม่ (จำกัดจำนวนตาม TOAST_LIMIT)
 * - UPDATE_TOAST: อัพเดท toast ที่มีอยู่
 * - DISMISS_TOAST: ซ่อน toast (ตั้ง open = false และเพิ่มเข้า remove queue)
 * - REMOVE_TOAST: ลบ toast ออกจาก state
 * 
 * @param {State} state - State ปัจจุบัน
 * @param {Action} action - Action ที่ต้องการทำ
 * @returns {State} - State ใหม่
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

/**
 * dispatch - Dispatch action เพื่ออัพเดท toast state
 * 
 * หน้าที่:
 * - อัพเดท memory state ด้วย reducer
 * - แจ้งเตือน listeners ทั้งหมดให้อัพเดท state
 * 
 * @param {Action} action - Action ที่ต้องการ dispatch
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

/**
 * toast - Function สำหรับสร้างและแสดง toast notification
 * 
 * หน้าที่:
 * - สร้าง toast ใหม่พร้อม unique ID
 * - เพิ่ม toast เข้า state และแสดงบนหน้าจอ
 * - Return methods สำหรับ update และ dismiss toast
 * 
 * @param {Toast} props - Toast properties (title, description, variant, etc.)
 * @returns {object} - Object ที่มี id, dismiss, และ update methods
 * 
 * ตัวอย่างการใช้งาน:
 * const { id, dismiss, update } = toast({ title: "สำเร็จ", description: "บันทึกข้อมูลเรียบร้อย" });
 * update({ description: "อัพเดทข้อความใหม่" }); // อัพเดท toast
 * dismiss(); // ปิด toast
 */
function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * useToast Hook - Hook สำหรับจัดการ toast notifications
 * 
 * หน้าที่:
 * - ให้ access ถึง toast state และ functions
 * - Subscribe ถึง toast state changes
 * - Provide methods สำหรับสร้างและ dismiss toast
 * 
 * @returns {object} - Object ที่มี:
 *   - toasts: Array ของ toast objects
 *   - toast: Function สำหรับสร้าง toast
 *   - dismiss: Function สำหรับปิด toast
 * 
 * ตัวอย่างการใช้งาน:
 * const { toast, dismiss } = useToast();
 * toast({ title: "สำเร็จ", description: "บันทึกข้อมูลเรียบร้อย" });
 * dismiss("toast-id"); // ปิด toast ที่มี id = "toast-id"
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  /**
   * useEffect Hook - Subscribe ถึง toast state changes
   * 
   * ทำงานเมื่อ component mount และ unsubscribe เมื่อ unmount
   * 
   * Flow:
   * 1. เพิ่ม setState เข้า listeners array
   * 2. เมื่อ dispatch ถูกเรียก → setState จะถูกเรียก → component re-render
   * 3. Cleanup: ลบ setState ออกจาก listeners เมื่อ component unmount
   */
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
