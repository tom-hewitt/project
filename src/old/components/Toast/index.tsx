import { AnimatePresence, motion } from "framer-motion";
import { useToaster } from "react-hot-toast";
import styles from "./styles.module.css";

export default function Toasts() {
  const { toasts } = useToaster({ duration: 2000 });

  return (
    <AnimatePresence>
      <div className={styles.toasts}>
        {toasts.reverse().map((toast) => (
          <motion.div
            className={styles.toast}
            initial={{ x: 50, opacity: 0 }}
            animate={{
              x: 0,
              scale: toast.visible ? 1 : 0.5,
              opacity: toast.visible ? 1 : 0,
            }}
            transition={{ type: "tween", ease: "easeInOut" }}
            key={toast.id}
            {...toast.ariaProps}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
