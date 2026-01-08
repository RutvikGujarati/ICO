import { useState } from "react";

export type ToastType = "success" | "error" | "info";

export const useToast = () => {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState<ToastType>("info");

    const toast = (msg: string, t: ToastType = "info") => {
        setMessage(msg);
        setType(t);
        setShow(true);
    };

    return {
        show,
        message,
        type,
        setShow,
        toast
    };
};
